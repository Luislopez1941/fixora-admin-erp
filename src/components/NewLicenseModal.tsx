import { useState, useEffect, useRef } from "react";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import APIs, { type DeploymentMode } from "../services/APIs";
import { useFetch } from "../lib/useFetch";
import type { CompanyRow } from "../lib/types";

export { MODE_LABEL, MODE_DESCRIPTION } from "./NewClientUserModal";

interface ClientUserOption {
  id: number;
  email: string;
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  deploymentMode: DeploymentMode;
  active: boolean;
}

interface ModuleCatalogItem {
  moduleId: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (licenseKey: string) => void;
}

// Solo expiración/estado/vínculo con un usuario YA EXISTENTE (dado de alta en
// Usuarios). La única excepción es OFFLINE, que puede generarse en blanco — sin
// usuario todavía — para que el cliente la complete al instalar.
export default function NewLicenseModal({ open, onClose, onCreated }: Props) {
  const [clientUserId, setClientUserId] = useState<"blank" | string>("blank");
  const [companySelection, setCompanySelection] = useState<"new" | string>(
    "new",
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "licencia" | "modulos" | "limites"
  >("licencia");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [maxCompanies, setMaxCompanies] = useState<string>("");
  const [maxBranches, setMaxBranches] = useState<string>("");
  const [maxUsers, setMaxUsers] = useState<string>("");
  const [unlimitedCompanies, setUnlimitedCompanies] = useState(true);
  const [unlimitedBranches, setUnlimitedBranches] = useState(true);
  const [unlimitedUsers, setUnlimitedUsers] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);

  const { data: companies } = useFetch<CompanyRow[]>(() =>
    APIs.getCompanies<CompanyRow[]>(),
  );
  const { data: usersResponse } = useFetch<{ users: ClientUserOption[] }>(() =>
    APIs.getClientUsers<{ users: ClientUserOption[] }>(),
  );
  const { data: modulesResponse } = useFetch<{ modules: ModuleCatalogItem[] }>(
    () => APIs.getLicenseModulesCatalog<{ modules: ModuleCatalogItem[] }>(),
  );
  const clientUsers = usersResponse?.users ?? [];
  const selectedUser =
    clientUserId !== "blank"
      ? clientUsers.find((u) => u.id === Number(clientUserId))
      : undefined;

  // Agrupa el catálogo plano (dashboard, sales, sales.sheet, sales.quote…) por su
  // prefijo — "sales" es el padre de "sales.sheet"/"sales.quote"/etc, igual que ya
  // se agrupan visualmente en el seed de back-end-fixora-erp.
  const moduleGroups = (() => {
    const all = modulesResponse?.modules ?? [];
    const parents = all.filter((m) => !m.moduleId.includes("."));
    return parents.map((parent) => ({
      parent,
      children: all.filter(
        (m) =>
          m.moduleId !== parent.moduleId &&
          m.moduleId.startsWith(`${parent.moduleId}.`),
      ),
    }));
  })();

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId],
    );
  };

  const toggleModuleGroup = (
    parentId: string,
    children: ModuleCatalogItem[],
  ) => {
    const groupIds = [parentId, ...children.map((c) => c.moduleId)];
    const allSelected = groupIds.every((id) => selectedModules.includes(id));
    setSelectedModules((prev) =>
      allSelected
        ? prev.filter((id) => !groupIds.includes(id))
        : [...new Set([...prev, ...groupIds])],
    );
  };

  // Total según los módulos marcados y el ciclo elegido (Mensual/Anual) — solo
  // informativo para el admin al armar la licencia, no se guarda en ningún lado.
  const allModules = modulesResponse?.modules ?? [];
  const currency = allModules[0]?.currency ?? "MXN";
  const totalPrice = selectedModules.reduce((sum, id) => {
    const mod = allModules.find((m) => m.moduleId === id);
    if (!mod) return sum;
    return (
      sum + (billingCycle === "monthly" ? mod.priceMonthly : mod.priceAnnual)
    );
  }, 0);
  const fmtPrice = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(n);

  useEffect(() => {
    if (!showCalendar) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const close = () => {
    if (submitting) return;
    onClose();
    setClientUserId("blank");
    setCompanySelection("new");
    setExpiresAt(null);
    setShowCalendar(false);
    setFormError(null);
    setSelectedModules([]);
    setActiveTab("licencia");
    setBillingCycle("monthly");
    setMaxCompanies("");
    setMaxBranches("");
    setMaxUsers("");
    setUnlimitedCompanies(true);
    setUnlimitedBranches(true);
    setUnlimitedUsers(true);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const str = (name: string) => (fd.get(name) as string)?.trim() || undefined;

    setFormError(null);
    if (clientUserId === "blank" && companySelection !== "new") {
      setActiveTab("licencia");
      setFormError(
        "Para vincular una empresa existente, primero elige el usuario dueño.",
      );
      return;
    }
    if (expiresAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiresAt < today) {
        setActiveTab("licencia");
        setFormError("La fecha de expiración no puede ser en el pasado.");
        return;
      }
    }
    const limitChecks: Array<[boolean, string, string]> = [
      [unlimitedCompanies, maxCompanies, "empresas"],
      [unlimitedBranches, maxBranches, "sucursales"],
      [unlimitedUsers, maxUsers, "usuarios"],
    ];
    for (const [unlimited, value, label] of limitChecks) {
      if (!unlimited && (!value || Number(value) < 1)) {
        setActiveTab("limites");
        setFormError(
          `Indica un número válido de ${label}, o márcalo como ilimitado.`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await APIs.createLicense<{ license: { key: string } }>({
        clientUserId:
          clientUserId !== "blank" ? Number(clientUserId) : undefined,
        deploymentMode: clientUserId === "blank" ? "OFFLINE" : undefined,
        companyName: str("companyName"),
        branchName: str("branchName"),
        erpCompanyId:
          companySelection !== "new" ? Number(companySelection) : undefined,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
        modules: selectedModules,
        maxCompanies: unlimitedCompanies ? null : Number(maxCompanies),
        maxBranches: unlimitedBranches ? null : Number(maxBranches),
        maxUsers: unlimitedUsers ? null : Number(maxUsers),
      });
      close();
      onCreated(res.license.key);
    } catch (err: any) {
      setFormError(err.message || "Error al crear la licencia.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={close}>
          <span className="msr">close</span>
        </button>
        <form className="modal__form" onSubmit={handleCreate}>
          <div className="modal-tabs">
            <button
              type="button"
              className={`modal-tabs__item ${activeTab === "licencia" ? "modal-tabs__item--active" : ""}`}
              onClick={() => setActiveTab("licencia")}
            >
              <span className="msr" style={{ fontSize: 16 }}>
                key
              </span>
              Licencia
            </button>
            <button
              type="button"
              className={`modal-tabs__item ${activeTab === "modulos" ? "modal-tabs__item--active" : ""}`}
              onClick={() => setActiveTab("modulos")}
            >
              <span className="msr" style={{ fontSize: 16 }}>
                apps
              </span>
              Módulos
              {selectedModules.length > 0 && (
                <span className="modal-tabs__badge">
                  {selectedModules.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`modal-tabs__item ${activeTab === "limites" ? "modal-tabs__item--active" : ""}`}
              onClick={() => setActiveTab("limites")}
            >
              <span className="msr" style={{ fontSize: 16 }}>
                tune
              </span>
              Límites
            </button>
          </div>
          <div className="modal__body">
            <div
              className="modal-section"
              style={{ display: activeTab === "licencia" ? undefined : "none" }}
            >
              <div className="form-row form-row--triple">
                <div className="form-group">
                  <label htmlFor="clientUserId">Usuario dueño *</label>
                  <select
                    id="clientUserId"
                    value={clientUserId}
                    onChange={(e) => {
                      setClientUserId(e.target.value);
                      setCompanySelection("new");
                    }}
                  >
                    <option value="blank">
                      + Offline en blanco (sin usuario)
                    </option>
                    {clientUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.firstLastName} — {u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="companySelection">Empresa</label>
                  <select
                    id="companySelection"
                    value={companySelection}
                    onChange={(e) => setCompanySelection(e.target.value)}
                    disabled={clientUserId === "blank"}
                  >
                    <option value="new">+ Nueva (la crea el cliente)</option>
                    {companies?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.businessName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group date-field" ref={calendarRef}>
                  <label htmlFor="expiresAt">Expira (opcional)</label>
                  <button
                    type="button"
                    id="expiresAt"
                    className="date-field__trigger"
                    onClick={() => setShowCalendar((s) => !s)}
                  >
                    <span className="msr" style={{ fontSize: 16 }}>
                      event
                    </span>
                    {expiresAt
                      ? expiresAt.toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Sin expiración"}
                  </button>
                  {showCalendar && (
                    <div className="date-field__popover">
                      <Calendar
                        date={expiresAt ?? new Date()}
                        onChange={(d) => {
                          setExpiresAt(d);
                          setShowCalendar(false);
                        }}
                        minDate={new Date()}
                        color="#3f7dc0"
                      />
                      {expiresAt && (
                        <button
                          type="button"
                          className="date-field__clear"
                          onClick={() => {
                            setExpiresAt(null);
                            setShowCalendar(false);
                          }}
                        >
                          <span className="msr" style={{ fontSize: 15 }}>
                            event_busy
                          </span>
                          Quitar fecha — licencia perpetua
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedUser && (
                <small className="modal-hint">
                  Modo {selectedUser.deploymentMode} (el del usuario — no se
                  vuelve a preguntar).
                </small>
              )}
              {clientUserId === "blank" && (
                <small className="modal-hint">
                  Licencia Offline sin dueño todavía — el cliente la completa al
                  instalar con el archivo firmado.
                </small>
              )}
              {companySelection !== "new" && (
                <small className="modal-hint">
                  Esta licencia se agregará como una sucursal/terminal nueva de
                  esa empresa — no se duplica.
                </small>
              )}

              <div className="form-row form-row--triple">
                <div className="form-group">
                  <label htmlFor="companyName">
                    Nombre de la empresa (opcional)
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Ej. Ferretería El Tornillo"
                    disabled={companySelection !== "new"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branchName">
                    Nombre de sucursal (opcional)
                  </label>
                  <input
                    id="branchName"
                    name="branchName"
                    type="text"
                    placeholder="Ej. Sucursal Centro"
                  />
                </div>
              </div>
            </div>

            <div
              className="modal-section"
              style={{ display: activeTab === "modulos" ? undefined : "none" }}
            >
              <div className="license-modules__head">
                <small className="modal-hint" style={{ marginTop: 0 }}>
                  El cliente los recibe habilitados al activar esta licencia
                  desde su login. Puedes dejarlo vacío y asignarlos después.
                </small>
                <div className="billing-toggle">
                  <button
                    type="button"
                    className={
                      billingCycle === "monthly"
                        ? "billing-toggle__item billing-toggle__item--active"
                        : "billing-toggle__item"
                    }
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Mensual
                  </button>
                  <button
                    type="button"
                    className={
                      billingCycle === "annual"
                        ? "billing-toggle__item billing-toggle__item--active"
                        : "billing-toggle__item"
                    }
                    onClick={() => setBillingCycle("annual")}
                  >
                    Anual
                  </button>
                </div>
              </div>

              <div className="license-total">
                <span className="license-total__label">
                  Total {billingCycle === "monthly" ? "mensual" : "anual"} (
                  {selectedModules.length} módulo
                  {selectedModules.length === 1 ? "" : "s"})
                </span>
                <span className="license-total__value">
                  {fmtPrice(totalPrice)}
                </span>
              </div>

              <div className="license-modules">
                {moduleGroups.map(({ parent, children }) => {
                  const groupIds = [
                    parent.moduleId,
                    ...children.map((c) => c.moduleId),
                  ];
                  const allSelected = groupIds.every((id) =>
                    selectedModules.includes(id),
                  );
                  const someSelected =
                    !allSelected &&
                    groupIds.some((id) => selectedModules.includes(id));
                  return (
                    <div
                      className="license-modules__group"
                      key={parent.moduleId}
                    >
                      <label className="license-modules__parent">
                        <input
                          type="checkbox"
                          className="ui-checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected;
                          }}
                          onChange={() =>
                            toggleModuleGroup(parent.moduleId, children)
                          }
                        />
                        {parent.name}
                      </label>
                      {children.length > 0 && (
                        <div className="license-modules__children">
                          {children.map((child) => (
                            <label
                              className="license-modules__child"
                              key={child.moduleId}
                            >
                              <input
                                type="checkbox"
                                className="ui-checkbox"
                                checked={selectedModules.includes(
                                  child.moduleId,
                                )}
                                onChange={() => toggleModule(child.moduleId)}
                              />
                              {child.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="modal-section"
              style={{ display: activeTab === "limites" ? undefined : "none" }}
            >
              <small className="modal-hint" style={{ marginTop: 0 }}>
                Cuántas empresas, sucursales y usuarios puede crear este
                cliente. Déjalo en "Ilimitado" si no quieres restringirlo.
              </small>

              <div className="license-limits">
                <div className="license-limits__row">
                  <span className="license-limits__label">Empresas</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={maxCompanies}
                    disabled={unlimitedCompanies}
                    onChange={(e) => setMaxCompanies(e.target.value)}
                  />
                  <label className="license-limits__unlimited">
                    <input
                      type="checkbox"
                      className="ui-checkbox"
                      checked={unlimitedCompanies}
                      onChange={(e) => setUnlimitedCompanies(e.target.checked)}
                    />
                    Ilimitado
                  </label>
                </div>
                <div className="license-limits__row">
                  <span className="license-limits__label">Sucursales</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={maxBranches}
                    disabled={unlimitedBranches}
                    onChange={(e) => setMaxBranches(e.target.value)}
                  />
                  <label className="license-limits__unlimited">
                    <input
                      type="checkbox"
                      className="ui-checkbox"
                      checked={unlimitedBranches}
                      onChange={(e) => setUnlimitedBranches(e.target.checked)}
                    />
                    Ilimitado
                  </label>
                </div>
                <div className="license-limits__row">
                  <span className="license-limits__label">Usuarios</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={maxUsers}
                    disabled={unlimitedUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                  />
                  <label className="license-limits__unlimited">
                    <input
                      type="checkbox"
                      className="ui-checkbox"
                      checked={unlimitedUsers}
                      onChange={(e) => setUnlimitedUsers(e.target.checked)}
                    />
                    Ilimitado
                  </label>
                </div>
              </div>
            </div>

            {formError && (
              <div className="modal-error">
                <span className="msr" style={{ fontSize: 16 }}>
                  error
                </span>
                {formError}
              </div>
            )}
          </div>
          <div className="modal__foot">
            <button
              type="button"
              className="btn-secondary"
              onClick={close}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>
                  progress_activity
                </span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>
                  add
                </span>
              )}
              {submitting ? "Creando…" : "Crear licencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
