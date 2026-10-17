// ARCHIVO GENERADO por fixora-erp/scripts/modules/generate.mjs a partir de taxonomy.mjs — no editar a mano.

export interface TaxonomyModule {
  key: string
  label: string
  /** Icono Material Symbols */
  symbol: string
  order: number
  description: string
  groups: { key: string | null; label: string | null; screens: { label: string; live: boolean }[] }[]
}

export const TAXONOMY_MODULES: TaxonomyModule[] = [
  {
    "key": "dashboard",
    "label": "Panel",
    "symbol": "dashboard",
    "order": 10,
    "description": "Panel principal: indicadores, pendientes y actividad.",
    "groups": [
      {
        "key": null,
        "label": null,
        "screens": [
          {
            "label": "Dashboard",
            "live": true
          },
          {
            "label": "Indicadores",
            "live": false
          },
          {
            "label": "Pendientes",
            "live": false
          },
          {
            "label": "Actividad reciente",
            "live": false
          },
          {
            "label": "Favoritos",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "sales",
    "label": "Ventas",
    "symbol": "sell",
    "order": 20,
    "description": "Punto de venta, gestión comercial, descuentos, cobros, devoluciones y configuración de ventas.",
    "groups": [
      {
        "key": "punto-de-venta",
        "label": "Punto de venta",
        "screens": [
          {
            "label": "Terminal POS",
            "live": true
          },
          {
            "label": "Nueva venta",
            "live": false
          },
          {
            "label": "Suspender y recuperar venta",
            "live": false
          },
          {
            "label": "Devoluciones rápidas",
            "live": false
          }
        ]
      },
      {
        "key": "gestion-comercial",
        "label": "Gestión comercial",
        "screens": [
          {
            "label": "Cotizaciones",
            "live": true
          },
          {
            "label": "Pedidos de clientes",
            "live": false
          },
          {
            "label": "Órdenes de venta",
            "live": true
          },
          {
            "label": "Historial de ventas",
            "live": false
          },
          {
            "label": "Detalle de venta",
            "live": false
          }
        ]
      },
      {
        "key": "descuentos-y-promociones",
        "label": "Descuentos y promociones",
        "screens": [
          {
            "label": "Promociones",
            "live": false
          },
          {
            "label": "Cupones",
            "live": false
          },
          {
            "label": "Reglas de descuento",
            "live": false
          },
          {
            "label": "Autorizaciones",
            "live": false
          },
          {
            "label": "Precios especiales",
            "live": false
          }
        ]
      },
      {
        "key": "cobros",
        "label": "Cobros",
        "screens": [
          {
            "label": "Registrar cobro",
            "live": false
          },
          {
            "label": "Pagos mixtos",
            "live": false
          },
          {
            "label": "Pagos parciales",
            "live": false
          },
          {
            "label": "Reembolsos",
            "live": false
          },
          {
            "label": "Métodos de cobro",
            "live": false
          }
        ]
      },
      {
        "key": "devoluciones-y-cancelaciones",
        "label": "Devoluciones y cancelaciones",
        "screens": [
          {
            "label": "Devoluciones",
            "live": false
          },
          {
            "label": "Notas de crédito",
            "live": false
          },
          {
            "label": "Solicitudes de cancelación",
            "live": false
          },
          {
            "label": "Historial de autorizaciones",
            "live": false
          }
        ]
      },
      {
        "key": "configuracion-de-ventas",
        "label": "Configuración de ventas",
        "screens": [
          {
            "label": "Reglas de venta",
            "live": true
          },
          {
            "label": "Canales",
            "live": false
          },
          {
            "label": "Comisiones",
            "live": false
          },
          {
            "label": "Políticas comerciales",
            "live": false
          },
          {
            "label": "Series de documentos",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "customers",
    "label": "Clientes y CRM",
    "symbol": "contacts",
    "order": 30,
    "description": "Directorio de clientes, CRM y relación comercial.",
    "groups": [
      {
        "key": "clientes",
        "label": "Clientes",
        "screens": [
          {
            "label": "Directorio",
            "live": true
          },
          {
            "label": "Alta y edición",
            "live": false
          },
          {
            "label": "Contactos",
            "live": false
          },
          {
            "label": "Direcciones",
            "live": false
          },
          {
            "label": "Clasificación",
            "live": false
          },
          {
            "label": "Historial de compras",
            "live": false
          }
        ]
      },
      {
        "key": "crm",
        "label": "CRM",
        "screens": [
          {
            "label": "Prospectos",
            "live": false
          },
          {
            "label": "Oportunidades",
            "live": false
          },
          {
            "label": "Actividades",
            "live": false
          },
          {
            "label": "Seguimientos",
            "live": false
          },
          {
            "label": "Campañas",
            "live": false
          },
          {
            "label": "Embudo comercial",
            "live": false
          }
        ]
      },
      {
        "key": "relacion-comercial",
        "label": "Relación comercial",
        "screens": [
          {
            "label": "Contratos",
            "live": false
          },
          {
            "label": "Condiciones comerciales",
            "live": false
          },
          {
            "label": "Listas de precios",
            "live": false
          },
          {
            "label": "Comunicaciones",
            "live": false
          },
          {
            "label": "Renovaciones",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "cobranza",
    "label": "Cuentas por cobrar",
    "symbol": "payments",
    "order": 40,
    "description": "Cartera, cobranza y seguimiento de saldos de clientes.",
    "groups": [
      {
        "key": "cartera",
        "label": "Cartera",
        "screens": [
          {
            "label": "Cuentas de crédito",
            "live": true
          },
          {
            "label": "Deudores",
            "live": true
          },
          {
            "label": "Documentos pendientes",
            "live": false
          },
          {
            "label": "Anticipos",
            "live": false
          },
          {
            "label": "Saldos a favor",
            "live": false
          }
        ]
      },
      {
        "key": "cobranza",
        "label": "Cobranza",
        "screens": [
          {
            "label": "Registrar abonos",
            "live": true
          },
          {
            "label": "Aplicar pagos",
            "live": false
          },
          {
            "label": "Pagos parciales",
            "live": false
          },
          {
            "label": "Recibos",
            "live": false
          },
          {
            "label": "Promesas de pago",
            "live": false
          }
        ]
      },
      {
        "key": "seguimiento",
        "label": "Seguimiento",
        "screens": [
          {
            "label": "Antigüedad de saldos",
            "live": false
          },
          {
            "label": "Vencimientos",
            "live": false
          },
          {
            "label": "Límites de crédito",
            "live": false
          },
          {
            "label": "Historial de cobranza",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "shopping",
    "label": "Compras",
    "symbol": "shopping_cart",
    "order": 50,
    "description": "Planeación, proveedores, adquisiciones, recepción y facturas de proveedor.",
    "groups": [
      {
        "key": "planeacion",
        "label": "Planeación",
        "screens": [
          {
            "label": "Solicitudes de compra",
            "live": false
          },
          {
            "label": "Requisiciones",
            "live": true
          },
          {
            "label": "Necesidades de reabastecimiento",
            "live": false
          }
        ]
      },
      {
        "key": "proveedores",
        "label": "Proveedores",
        "screens": [
          {
            "label": "Directorio",
            "live": true
          },
          {
            "label": "Contactos",
            "live": false
          },
          {
            "label": "Condiciones",
            "live": false
          },
          {
            "label": "Evaluaciones",
            "live": false
          },
          {
            "label": "Historial de precios",
            "live": false
          }
        ]
      },
      {
        "key": "adquisiciones",
        "label": "Adquisiciones",
        "screens": [
          {
            "label": "Solicitudes de cotización",
            "live": false
          },
          {
            "label": "Comparativas",
            "live": false
          },
          {
            "label": "Órdenes de compra",
            "live": true
          },
          {
            "label": "Autorizaciones",
            "live": false
          }
        ]
      },
      {
        "key": "recepcion-y-devoluciones",
        "label": "Recepción y devoluciones",
        "screens": [
          {
            "label": "Recepciones",
            "live": false
          },
          {
            "label": "Recepciones parciales",
            "live": false
          },
          {
            "label": "Devoluciones a proveedores",
            "live": false
          },
          {
            "label": "Diferencias",
            "live": false
          }
        ]
      },
      {
        "key": "facturas-de-proveedor",
        "label": "Facturas de proveedor",
        "screens": [
          {
            "label": "Facturas recibidas",
            "live": false
          },
          {
            "label": "Validación",
            "live": false
          },
          {
            "label": "Costos adicionales",
            "live": false
          },
          {
            "label": "Anticipos",
            "live": false
          },
          {
            "label": "Enlace a cuentas por pagar",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "cash-register",
    "label": "Caja",
    "symbol": "point_of_sale",
    "order": 60,
    "description": "Operación de caja, cortes, administración de cajas, turnos y controles.",
    "groups": [
      {
        "key": "operacion",
        "label": "Operación",
        "screens": [
          {
            "label": "Caja actual",
            "live": true
          },
          {
            "label": "Abrir caja",
            "live": false
          },
          {
            "label": "Turno activo",
            "live": false
          },
          {
            "label": "Movimientos",
            "live": true
          },
          {
            "label": "Ingresos",
            "live": false
          },
          {
            "label": "Retiros",
            "live": false
          },
          {
            "label": "Gastos",
            "live": false
          }
        ]
      },
      {
        "key": "cortes-y-arqueos",
        "label": "Cortes y arqueos",
        "screens": [
          {
            "label": "Corte de caja",
            "live": true
          },
          {
            "label": "Arqueo",
            "live": false
          },
          {
            "label": "Diferencias",
            "live": false
          },
          {
            "label": "Historial de cortes",
            "live": false
          },
          {
            "label": "Autorizaciones",
            "live": false
          }
        ]
      },
      {
        "key": "administracion-de-cajas",
        "label": "Administración de cajas",
        "screens": [
          {
            "label": "Cajas registradas",
            "live": true
          },
          {
            "label": "Asignaciones",
            "live": false
          },
          {
            "label": "Sucursales",
            "live": false
          },
          {
            "label": "Terminales",
            "live": false
          },
          {
            "label": "Configuración de caja",
            "live": true
          }
        ]
      },
      {
        "key": "turnos",
        "label": "Turnos",
        "screens": [
          {
            "label": "Turnos activos",
            "live": true
          },
          {
            "label": "Historial",
            "live": false
          },
          {
            "label": "Horarios",
            "live": false
          },
          {
            "label": "Programación",
            "live": true
          },
          {
            "label": "Rotaciones",
            "live": false
          },
          {
            "label": "Asignaciones de empleados",
            "live": false
          }
        ]
      },
      {
        "key": "control",
        "label": "Control",
        "screens": [
          {
            "label": "Límites",
            "live": false
          },
          {
            "label": "Fondos iniciales",
            "live": false
          },
          {
            "label": "Reglas de cierre",
            "live": false
          },
          {
            "label": "Denominaciones",
            "live": false
          },
          {
            "label": "Reglas de autorización",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "store",
    "label": "Inventario y almacenes",
    "symbol": "warehouse",
    "order": 70,
    "description": "Existencias, movimientos, control, lotes y series, reabastecimiento, costos y almacenes.",
    "groups": [
      {
        "key": "existencias",
        "label": "Existencias",
        "screens": [
          {
            "label": "Inventario actual",
            "live": true
          },
          {
            "label": "Existencias por sucursal",
            "live": false
          },
          {
            "label": "Existencias por almacén",
            "live": false
          },
          {
            "label": "Disponibilidad",
            "live": false
          },
          {
            "label": "Reservas",
            "live": false
          }
        ]
      },
      {
        "key": "movimientos",
        "label": "Movimientos",
        "screens": [
          {
            "label": "Entradas",
            "live": true
          },
          {
            "label": "Salidas",
            "live": true
          },
          {
            "label": "Ajustes",
            "live": false
          },
          {
            "label": "Traspasos",
            "live": true
          },
          {
            "label": "Recepciones",
            "live": false
          },
          {
            "label": "Inventario en tránsito",
            "live": false
          },
          {
            "label": "Pedidos",
            "live": true
          }
        ]
      },
      {
        "key": "control-de-inventario",
        "label": "Control de inventario",
        "screens": [
          {
            "label": "Kardex",
            "live": false
          },
          {
            "label": "Conteos físicos",
            "live": false
          },
          {
            "label": "Conteos cíclicos",
            "live": false
          },
          {
            "label": "Conciliación",
            "live": false
          },
          {
            "label": "Trazabilidad",
            "live": false
          }
        ]
      },
      {
        "key": "lotes-y-series",
        "label": "Lotes y series",
        "screens": [
          {
            "label": "Lotes",
            "live": false
          },
          {
            "label": "Números de serie",
            "live": false
          },
          {
            "label": "Caducidades",
            "live": false
          },
          {
            "label": "Trazabilidad de origen y destino",
            "live": false
          }
        ]
      },
      {
        "key": "reabastecimiento",
        "label": "Reabastecimiento",
        "screens": [
          {
            "label": "Mínimos y máximos",
            "live": false
          },
          {
            "label": "Alertas",
            "live": false
          },
          {
            "label": "Sugerencias de compra",
            "live": false
          },
          {
            "label": "Políticas de reposición",
            "live": false
          }
        ]
      },
      {
        "key": "costos",
        "label": "Costos",
        "screens": [
          {
            "label": "Costos de inventario",
            "live": false
          },
          {
            "label": "Valoración",
            "live": false
          },
          {
            "label": "Historial de costos",
            "live": false
          },
          {
            "label": "Configuración de valoración",
            "live": false
          }
        ]
      },
      {
        "key": "administracion-de-almacenes",
        "label": "Administración de almacenes",
        "screens": [
          {
            "label": "Almacenes",
            "live": true
          },
          {
            "label": "Ubicaciones internas",
            "live": false
          },
          {
            "label": "Zonas",
            "live": false
          },
          {
            "label": "Capacidad",
            "live": false
          },
          {
            "label": "Configuración",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "production",
    "label": "Producción y manufactura",
    "symbol": "precision_manufacturing",
    "order": 80,
    "description": "Órdenes, materiales y fórmulas, ejecución, planificación, calidad, mantenimiento y costos de fabricación.",
    "groups": [
      {
        "key": "ordenes-de-produccion",
        "label": "Órdenes de producción",
        "screens": [
          {
            "label": "Crear órdenes",
            "live": false
          },
          {
            "label": "Planificación",
            "live": false
          },
          {
            "label": "Cola de trabajo",
            "live": true
          },
          {
            "label": "Seguimiento",
            "live": true
          },
          {
            "label": "Cierre",
            "live": false
          }
        ]
      },
      {
        "key": "materiales-y-formulas",
        "label": "Materiales y fórmulas",
        "screens": [
          {
            "label": "Listas de materiales",
            "live": false
          },
          {
            "label": "Versiones",
            "live": false
          },
          {
            "label": "Recetas industriales",
            "live": false
          },
          {
            "label": "Subproductos",
            "live": false
          },
          {
            "label": "Sustituciones autorizadas",
            "live": false
          }
        ]
      },
      {
        "key": "ejecucion",
        "label": "Ejecución",
        "screens": [
          {
            "label": "Operaciones",
            "live": false
          },
          {
            "label": "Centros de trabajo",
            "live": true
          },
          {
            "label": "Consumos",
            "live": false
          },
          {
            "label": "Producto terminado",
            "live": false
          },
          {
            "label": "Mermas",
            "live": false
          },
          {
            "label": "Rechazos",
            "live": false
          }
        ]
      },
      {
        "key": "planificacion",
        "label": "Planificación",
        "screens": [
          {
            "label": "Necesidades de materiales",
            "live": false
          },
          {
            "label": "Capacidad",
            "live": false
          },
          {
            "label": "Calendarios",
            "live": false
          },
          {
            "label": "Programación de producción",
            "live": false
          }
        ]
      },
      {
        "key": "calidad-y-mantenimiento",
        "label": "Calidad y mantenimiento",
        "screens": [
          {
            "label": "Inspecciones",
            "live": false
          },
          {
            "label": "No conformidades",
            "live": false
          },
          {
            "label": "Equipos",
            "live": false
          },
          {
            "label": "Mantenimiento preventivo",
            "live": false
          },
          {
            "label": "Órdenes de mantenimiento",
            "live": false
          }
        ]
      },
      {
        "key": "costos-de-fabricacion",
        "label": "Costos de fabricación",
        "screens": [
          {
            "label": "Materiales",
            "live": false
          },
          {
            "label": "Mano de obra",
            "live": false
          },
          {
            "label": "Costos indirectos",
            "live": false
          },
          {
            "label": "Costos reales y estimados",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "restaurants",
    "label": "Restaurantes y Food Service",
    "symbol": "restaurant",
    "order": 90,
    "description": "Salón, comandas, menús, cocina (KDS), recetas y entrega.",
    "groups": [
      {
        "key": "salon",
        "label": "Salón",
        "screens": [
          {
            "label": "Plano",
            "live": false
          },
          {
            "label": "Salones",
            "live": false
          },
          {
            "label": "Zonas",
            "live": false
          },
          {
            "label": "Mesas",
            "live": false
          },
          {
            "label": "Asignación de meseros",
            "live": false
          },
          {
            "label": "Reservaciones",
            "live": false
          }
        ]
      },
      {
        "key": "comandas",
        "label": "Comandas",
        "screens": [
          {
            "label": "Nueva comanda",
            "live": false
          },
          {
            "label": "Modificaciones",
            "live": false
          },
          {
            "label": "División de cuentas",
            "live": false
          },
          {
            "label": "División de conceptos",
            "live": false
          },
          {
            "label": "Estados",
            "live": false
          }
        ]
      },
      {
        "key": "menus",
        "label": "Menús",
        "screens": [
          {
            "label": "Menús",
            "live": false
          },
          {
            "label": "Categorías",
            "live": false
          },
          {
            "label": "Platillos",
            "live": false
          },
          {
            "label": "Modificadores",
            "live": false
          },
          {
            "label": "Complementos",
            "live": false
          },
          {
            "label": "Disponibilidad",
            "live": false
          }
        ]
      },
      {
        "key": "cocina",
        "label": "Cocina",
        "screens": [
          {
            "label": "Estaciones",
            "live": false
          },
          {
            "label": "Cola de preparación",
            "live": false
          },
          {
            "label": "Enrutamiento",
            "live": false
          },
          {
            "label": "Tiempos",
            "live": false
          },
          {
            "label": "Pantalla KDS",
            "live": false
          }
        ]
      },
      {
        "key": "recetas",
        "label": "Recetas",
        "screens": [
          {
            "label": "Ingredientes",
            "live": false
          },
          {
            "label": "Subrecetas",
            "live": false
          },
          {
            "label": "Rendimientos",
            "live": false
          },
          {
            "label": "Unidades de consumo",
            "live": false
          },
          {
            "label": "Mermas",
            "live": false
          },
          {
            "label": "Costos",
            "live": false
          }
        ]
      },
      {
        "key": "entrega",
        "label": "Entrega",
        "screens": [
          {
            "label": "Para llevar",
            "live": false
          },
          {
            "label": "Reparto",
            "live": false
          },
          {
            "label": "Entregas",
            "live": false
          },
          {
            "label": "Canales externos",
            "live": false
          },
          {
            "label": "Seguimiento de pedidos",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "catalogos",
    "label": "Catálogos",
    "symbol": "category",
    "order": 100,
    "description": "Productos y servicios, clasificación, unidades, precios, impuestos y otros catálogos.",
    "groups": [
      {
        "key": "productos-y-servicios",
        "label": "Productos y servicios",
        "screens": [
          {
            "label": "Artículos",
            "live": true
          },
          {
            "label": "Servicios",
            "live": true
          },
          {
            "label": "Variantes",
            "live": false
          },
          {
            "label": "Presentaciones",
            "live": false
          },
          {
            "label": "Códigos de barras",
            "live": false
          },
          {
            "label": "Kits y paquetes",
            "live": false
          }
        ]
      },
      {
        "key": "clasificacion",
        "label": "Clasificación",
        "screens": [
          {
            "label": "Familias",
            "live": true
          },
          {
            "label": "Categorías",
            "live": true
          },
          {
            "label": "Subcategorías",
            "live": false
          },
          {
            "label": "Marcas",
            "live": false
          },
          {
            "label": "Modelos",
            "live": false
          },
          {
            "label": "Atributos",
            "live": false
          },
          {
            "label": "Características",
            "live": false
          }
        ]
      },
      {
        "key": "unidades-y-cantidades",
        "label": "Unidades y cantidades",
        "screens": [
          {
            "label": "Unidades de medida",
            "live": true
          },
          {
            "label": "Conversiones",
            "live": false
          },
          {
            "label": "Unidades de compra",
            "live": false
          },
          {
            "label": "Unidades de venta",
            "live": false
          }
        ]
      },
      {
        "key": "precios-y-condiciones",
        "label": "Precios y condiciones",
        "screens": [
          {
            "label": "Listas de precios",
            "live": false
          },
          {
            "label": "Rangos",
            "live": true
          },
          {
            "label": "Tarifas",
            "live": false
          },
          {
            "label": "Condiciones comerciales",
            "live": false
          },
          {
            "label": "Reglas de precio",
            "live": false
          }
        ]
      },
      {
        "key": "impuestos-y-monedas",
        "label": "Impuestos y monedas",
        "screens": [
          {
            "label": "Impuestos",
            "live": false
          },
          {
            "label": "Monedas",
            "live": false
          },
          {
            "label": "Tipos de cambio",
            "live": false
          },
          {
            "label": "Catálogos fiscales",
            "live": false
          }
        ]
      },
      {
        "key": "otros-catalogos",
        "label": "Otros catálogos",
        "screens": [
          {
            "label": "Métodos de pago",
            "live": true
          },
          {
            "label": "Motivos de ajuste",
            "live": false
          },
          {
            "label": "Motivos de cancelación",
            "live": false
          },
          {
            "label": "Tipos de documento",
            "live": false
          },
          {
            "label": "Tipos de área",
            "live": true
          },
          {
            "label": "Subáreas",
            "live": true
          }
        ]
      }
    ]
  },
  {
    "key": "finance",
    "label": "Finanzas y contabilidad",
    "symbol": "account_balance",
    "order": 110,
    "description": "Contabilidad general, cierres, cuentas por pagar, bancos, costos, activos fijos, consolidación y estados financieros.",
    "groups": [
      {
        "key": "contabilidad-general",
        "label": "Contabilidad general",
        "screens": [
          {
            "label": "Catálogo de cuentas",
            "live": false
          },
          {
            "label": "Pólizas",
            "live": false
          },
          {
            "label": "Asientos",
            "live": false
          },
          {
            "label": "Libro diario",
            "live": false
          },
          {
            "label": "Mayor",
            "live": false
          },
          {
            "label": "Balanza de comprobación",
            "live": false
          }
        ]
      },
      {
        "key": "cierres-contables",
        "label": "Cierres contables",
        "screens": [
          {
            "label": "Periodos",
            "live": false
          },
          {
            "label": "Ejercicios",
            "live": false
          },
          {
            "label": "Aperturas",
            "live": false
          },
          {
            "label": "Ajustes",
            "live": false
          },
          {
            "label": "Reversiones",
            "live": false
          },
          {
            "label": "Cierre mensual y anual",
            "live": false
          }
        ]
      },
      {
        "key": "cuentas-por-pagar",
        "label": "Cuentas por pagar",
        "screens": [
          {
            "label": "Facturas",
            "live": false
          },
          {
            "label": "Anticipos",
            "live": false
          },
          {
            "label": "Vencimientos",
            "live": false
          },
          {
            "label": "Pagos",
            "live": false
          },
          {
            "label": "Aplicaciones",
            "live": false
          },
          {
            "label": "Propuestas de pago",
            "live": false
          }
        ]
      },
      {
        "key": "bancos-y-tesoreria",
        "label": "Bancos y tesorería",
        "screens": [
          {
            "label": "Cuentas bancarias",
            "live": false
          },
          {
            "label": "Transferencias",
            "live": false
          },
          {
            "label": "Conciliación bancaria",
            "live": false
          },
          {
            "label": "Flujo de efectivo",
            "live": false
          }
        ]
      },
      {
        "key": "costos-y-presupuestos",
        "label": "Costos y presupuestos",
        "screens": [
          {
            "label": "Centros de costos",
            "live": false
          },
          {
            "label": "Dimensiones",
            "live": false
          },
          {
            "label": "Presupuestos",
            "live": false
          },
          {
            "label": "Prorrateos",
            "live": false
          },
          {
            "label": "Análisis de desviaciones",
            "live": false
          }
        ]
      },
      {
        "key": "activos-fijos",
        "label": "Activos fijos",
        "screens": [
          {
            "label": "Registro",
            "live": false
          },
          {
            "label": "Depreciación",
            "live": false
          },
          {
            "label": "Mejoras",
            "live": false
          },
          {
            "label": "Deterioro",
            "live": false
          },
          {
            "label": "Bajas",
            "live": false
          },
          {
            "label": "Disposición",
            "live": false
          }
        ]
      },
      {
        "key": "multimoneda-y-consolidacion",
        "label": "Multimoneda y consolidación",
        "screens": [
          {
            "label": "Diferencias cambiarias",
            "live": false
          },
          {
            "label": "Intercompañía",
            "live": false
          },
          {
            "label": "Eliminaciones",
            "live": false
          },
          {
            "label": "Estados consolidados",
            "live": false
          }
        ]
      },
      {
        "key": "estados-financieros",
        "label": "Estados financieros",
        "screens": [
          {
            "label": "Balance general",
            "live": false
          },
          {
            "label": "Resultados",
            "live": false
          },
          {
            "label": "Flujo de efectivo",
            "live": false
          },
          {
            "label": "Cambios en capital",
            "live": false
          },
          {
            "label": "Auxiliares",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "fiscal",
    "label": "Facturación y fiscal",
    "symbol": "receipt_long",
    "order": 120,
    "description": "CFDI, complementos y cancelaciones, nómina fiscal, contabilidad electrónica y configuración fiscal.",
    "groups": [
      {
        "key": "cfdi",
        "label": "CFDI",
        "screens": [
          {
            "label": "Emisión",
            "live": false
          },
          {
            "label": "Recepción",
            "live": false
          },
          {
            "label": "Documentos relacionados",
            "live": false
          },
          {
            "label": "UUID",
            "live": false
          },
          {
            "label": "Estados",
            "live": false
          }
        ]
      },
      {
        "key": "complementos-y-cancelaciones",
        "label": "Complementos y cancelaciones",
        "screens": [
          {
            "label": "Complementos de pago",
            "live": false
          },
          {
            "label": "Solicitudes de cancelación",
            "live": false
          },
          {
            "label": "Sustituciones",
            "live": false
          },
          {
            "label": "Seguimiento",
            "live": false
          }
        ]
      },
      {
        "key": "nomina-fiscal",
        "label": "Nómina fiscal",
        "screens": [
          {
            "label": "CFDI de nómina",
            "live": false
          },
          {
            "label": "Timbrado",
            "live": false
          },
          {
            "label": "Cancelación",
            "live": false
          },
          {
            "label": "Historial de respuestas",
            "live": false
          }
        ]
      },
      {
        "key": "contabilidad-electronica",
        "label": "Contabilidad electrónica",
        "screens": [
          {
            "label": "Catálogo de cuentas fiscal",
            "live": false
          },
          {
            "label": "Balanza",
            "live": false
          },
          {
            "label": "Pólizas y auxiliares cuando correspondan",
            "live": false
          }
        ]
      },
      {
        "key": "configuracion-fiscal",
        "label": "Configuración fiscal",
        "screens": [
          {
            "label": "Datos fiscales",
            "live": false
          },
          {
            "label": "Impuestos",
            "live": false
          },
          {
            "label": "Certificados protegidos",
            "live": false
          },
          {
            "label": "PAC",
            "live": false
          },
          {
            "label": "Catálogos versionados",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "hr",
    "label": "Recursos humanos",
    "symbol": "groups",
    "order": 130,
    "description": "Personal, reclutamiento, asistencia, ausencias, nómina, desarrollo, autoservicio y reportes de RH.",
    "groups": [
      {
        "key": "personal",
        "label": "Personal",
        "screens": [
          {
            "label": "Expedientes",
            "live": false
          },
          {
            "label": "Puestos",
            "live": false
          },
          {
            "label": "Departamentos",
            "live": false
          },
          {
            "label": "Organigrama",
            "live": false
          },
          {
            "label": "Historial laboral",
            "live": false
          },
          {
            "label": "Altas y bajas",
            "live": false
          }
        ]
      },
      {
        "key": "reclutamiento",
        "label": "Reclutamiento",
        "screens": [
          {
            "label": "Vacantes",
            "live": false
          },
          {
            "label": "Candidatos",
            "live": false
          },
          {
            "label": "Entrevistas",
            "live": false
          },
          {
            "label": "Selección",
            "live": false
          },
          {
            "label": "Contratación",
            "live": false
          },
          {
            "label": "Onboarding",
            "live": false
          }
        ]
      },
      {
        "key": "asistencia-y-horarios",
        "label": "Asistencia y horarios",
        "screens": [
          {
            "label": "Horarios",
            "live": false
          },
          {
            "label": "Turnos laborales",
            "live": false
          },
          {
            "label": "Marcajes",
            "live": false
          },
          {
            "label": "Retardos",
            "live": false
          },
          {
            "label": "Incidencias",
            "live": false
          },
          {
            "label": "Horas extra",
            "live": false
          }
        ]
      },
      {
        "key": "ausencias-y-prestaciones",
        "label": "Ausencias y prestaciones",
        "screens": [
          {
            "label": "Vacaciones",
            "live": false
          },
          {
            "label": "Permisos",
            "live": false
          },
          {
            "label": "Incapacidades",
            "live": false
          },
          {
            "label": "Prestaciones",
            "live": false
          },
          {
            "label": "Saldos y solicitudes",
            "live": false
          }
        ]
      },
      {
        "key": "nomina",
        "label": "Nómina",
        "screens": [
          {
            "label": "Periodos",
            "live": false
          },
          {
            "label": "Percepciones",
            "live": false
          },
          {
            "label": "Deducciones",
            "live": false
          },
          {
            "label": "Comisiones",
            "live": false
          },
          {
            "label": "Cálculo",
            "live": false
          },
          {
            "label": "Aprobación",
            "live": false
          },
          {
            "label": "Recibos",
            "live": false
          },
          {
            "label": "Finiquitos",
            "live": false
          }
        ]
      },
      {
        "key": "desarrollo",
        "label": "Desarrollo",
        "screens": [
          {
            "label": "Capacitación",
            "live": false
          },
          {
            "label": "Certificaciones",
            "live": false
          },
          {
            "label": "Evaluaciones",
            "live": false
          },
          {
            "label": "Objetivos",
            "live": false
          },
          {
            "label": "Planes de desarrollo",
            "live": false
          }
        ]
      },
      {
        "key": "autoservicio",
        "label": "Autoservicio",
        "screens": [
          {
            "label": "Portal del empleado",
            "live": false
          },
          {
            "label": "Recibos",
            "live": false
          },
          {
            "label": "Solicitudes",
            "live": false
          },
          {
            "label": "Documentos",
            "live": false
          },
          {
            "label": "Actualización controlada de datos",
            "live": false
          }
        ]
      },
      {
        "key": "reportes-de-rh",
        "label": "Reportes de RH",
        "screens": [
          {
            "label": "Rotación",
            "live": false
          },
          {
            "label": "Ausentismo",
            "live": false
          },
          {
            "label": "Costos de nómina",
            "live": false
          },
          {
            "label": "Vacaciones pendientes",
            "live": false
          },
          {
            "label": "Plantilla",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "projects",
    "label": "Servicios y proyectos",
    "symbol": "assignment",
    "order": 140,
    "description": "Proyectos, órdenes de servicio, contratos y soporte.",
    "groups": [
      {
        "key": "proyectos",
        "label": "Proyectos",
        "screens": [
          {
            "label": "Proyectos",
            "live": false
          },
          {
            "label": "Tareas",
            "live": false
          },
          {
            "label": "Hitos",
            "live": false
          },
          {
            "label": "Recursos",
            "live": false
          },
          {
            "label": "Tiempos",
            "live": false
          },
          {
            "label": "Gastos",
            "live": false
          }
        ]
      },
      {
        "key": "servicios",
        "label": "Servicios",
        "screens": [
          {
            "label": "Órdenes de servicio",
            "live": false
          },
          {
            "label": "Tickets",
            "live": false
          },
          {
            "label": "Asignaciones",
            "live": false
          },
          {
            "label": "Visitas técnicas",
            "live": false
          }
        ]
      },
      {
        "key": "contratos",
        "label": "Contratos",
        "screens": [
          {
            "label": "Contratos",
            "live": false
          },
          {
            "label": "Suscripciones",
            "live": false
          },
          {
            "label": "Renovaciones",
            "live": false
          },
          {
            "label": "Facturación recurrente",
            "live": false
          }
        ]
      },
      {
        "key": "soporte",
        "label": "Soporte",
        "screens": [
          {
            "label": "Garantías",
            "live": false
          },
          {
            "label": "SLA",
            "live": false
          },
          {
            "label": "Incidencias",
            "live": false
          },
          {
            "label": "Historial de atención",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "realestate",
    "label": "Inmuebles y condominios",
    "symbol": "apartment",
    "order": 150,
    "description": "Inmuebles, propietarios y ocupantes, administración de cuotas y operación del condominio.",
    "groups": [
      {
        "key": "inmuebles",
        "label": "Inmuebles",
        "screens": [
          {
            "label": "Propiedades",
            "live": false
          },
          {
            "label": "Edificios",
            "live": false
          },
          {
            "label": "Torres",
            "live": false
          },
          {
            "label": "Unidades",
            "live": false
          },
          {
            "label": "Áreas comunes",
            "live": false
          }
        ]
      },
      {
        "key": "relaciones",
        "label": "Relaciones",
        "screens": [
          {
            "label": "Propietarios",
            "live": false
          },
          {
            "label": "Copropiedades",
            "live": false
          },
          {
            "label": "Ocupantes",
            "live": false
          },
          {
            "label": "Arrendamientos",
            "live": false
          }
        ]
      },
      {
        "key": "administracion",
        "label": "Administración",
        "screens": [
          {
            "label": "Cuotas",
            "live": false
          },
          {
            "label": "Cargos",
            "live": false
          },
          {
            "label": "Presupuestos",
            "live": false
          },
          {
            "label": "Gastos comunes",
            "live": false
          },
          {
            "label": "Aplicaciones de pagos",
            "live": false
          }
        ]
      },
      {
        "key": "operacion",
        "label": "Operación",
        "screens": [
          {
            "label": "Incidencias",
            "live": false
          },
          {
            "label": "Mantenimiento",
            "live": false
          },
          {
            "label": "Reservaciones",
            "live": false
          },
          {
            "label": "Accesos",
            "live": false
          },
          {
            "label": "Comunicados",
            "live": false
          },
          {
            "label": "Asambleas y votaciones",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "reports",
    "label": "Reportes y análisis",
    "symbol": "analytics",
    "order": 160,
    "description": "Reportes por área y reportes personalizados.",
    "groups": [
      {
        "key": null,
        "label": null,
        "screens": [
          {
            "label": "Ventas",
            "live": false
          },
          {
            "label": "Caja",
            "live": false
          },
          {
            "label": "Inventario",
            "live": false
          },
          {
            "label": "Compras",
            "live": false
          },
          {
            "label": "Finanzas",
            "live": false
          },
          {
            "label": "Fiscal",
            "live": false
          },
          {
            "label": "RH",
            "live": false
          },
          {
            "label": "Producción",
            "live": false
          },
          {
            "label": "Rentabilidad",
            "live": false
          },
          {
            "label": "Reportes personalizados",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "automation",
    "label": "Automatización e integraciones",
    "symbol": "bolt",
    "order": 170,
    "description": "Flujos y aprobaciones, integraciones, sincronización y notificaciones.",
    "groups": [
      {
        "key": "flujos-y-aprobaciones",
        "label": "Flujos y aprobaciones",
        "screens": [
          {
            "label": "Definiciones",
            "live": false
          },
          {
            "label": "Versiones",
            "live": false
          },
          {
            "label": "Instancias",
            "live": false
          },
          {
            "label": "Pasos",
            "live": false
          },
          {
            "label": "Reglas",
            "live": false
          },
          {
            "label": "Aprobaciones",
            "live": false
          }
        ]
      },
      {
        "key": "integraciones",
        "label": "Integraciones",
        "screens": [
          {
            "label": "Conectores",
            "live": false
          },
          {
            "label": "Credenciales referenciadas",
            "live": false
          },
          {
            "label": "Webhooks",
            "live": false
          },
          {
            "label": "Eventos",
            "live": false
          },
          {
            "label": "Suscripciones",
            "live": false
          }
        ]
      },
      {
        "key": "sincronizacion",
        "label": "Sincronización",
        "screens": [
          {
            "label": "Colas",
            "live": false
          },
          {
            "label": "Reintentos",
            "live": false
          },
          {
            "label": "Errores",
            "live": false
          },
          {
            "label": "Estado de sincronización",
            "live": false
          },
          {
            "label": "Idempotencia",
            "live": false
          }
        ]
      },
      {
        "key": "notificaciones-y-auditoria-tecnica",
        "label": "Notificaciones y auditoría técnica",
        "screens": [
          {
            "label": "Plantillas",
            "live": false
          },
          {
            "label": "Notificaciones",
            "live": false
          },
          {
            "label": "Correlación",
            "live": false
          },
          {
            "label": "Registro de eventos",
            "live": false
          },
          {
            "label": "Historial de ejecución",
            "live": false
          }
        ]
      }
    ]
  },
  {
    "key": "admin",
    "label": "Administración y seguridad",
    "symbol": "admin_panel_settings",
    "order": 180,
    "description": "Organización, usuarios y accesos, seguridad y configuración avanzada.",
    "groups": [
      {
        "key": "organizacion",
        "label": "Organización",
        "screens": [
          {
            "label": "Empresas",
            "live": true
          },
          {
            "label": "Sucursales",
            "live": true
          },
          {
            "label": "Almacenes",
            "live": false
          },
          {
            "label": "Áreas",
            "live": true
          },
          {
            "label": "Series y folios",
            "live": true
          },
          {
            "label": "Configuración general",
            "live": false
          }
        ]
      },
      {
        "key": "usuarios-y-accesos",
        "label": "Usuarios y accesos",
        "screens": [
          {
            "label": "Usuarios",
            "live": true
          },
          {
            "label": "Personal vinculado",
            "live": false
          },
          {
            "label": "Roles",
            "live": true
          },
          {
            "label": "Permisos",
            "live": false
          },
          {
            "label": "Excepciones",
            "live": false
          },
          {
            "label": "Grupos de usuarios",
            "live": true
          }
        ]
      },
      {
        "key": "seguridad",
        "label": "Seguridad",
        "screens": [
          {
            "label": "Sesiones",
            "live": false
          },
          {
            "label": "Políticas de acceso",
            "live": false
          },
          {
            "label": "Autorizaciones",
            "live": false
          },
          {
            "label": "Auditoría",
            "live": true
          },
          {
            "label": "Historial de cambios",
            "live": false
          }
        ]
      },
      {
        "key": "configuracion-avanzada",
        "label": "Configuración avanzada",
        "screens": [
          {
            "label": "Parámetros generales",
            "live": false
          },
          {
            "label": "Preferencias",
            "live": false
          },
          {
            "label": "Plantillas",
            "live": false
          },
          {
            "label": "Numeración",
            "live": false
          },
          {
            "label": "Configuraciones por empresa y sucursal",
            "live": false
          },
          {
            "label": "Franquicia",
            "live": true
          }
        ]
      }
    ]
  }
]
