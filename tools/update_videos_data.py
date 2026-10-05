import json
import re

# Read backup_videos.json
with open('tools/backup_videos.json', 'r', encoding='utf-8') as f:
    backups = json.load(f)

# Complete 24 rich video objects
videos_data = [
  {
    "id": "va1_osi",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A1, A2",
    "titulo": "¿Que es el modelo OSI? | Modelo OSI bien explicado - Curso Redes CCNA 1 Episodio 13.2",
    "canal": "El Mundo del Networking",
    "duracion": "45 min",
    "nivel": "Masterclass Completa",
    "ytId": "KTcMdtpWi3U",
    "link": "https://www.youtube.com/watch?v=KTcMdtpWi3U",
    "backupTitulo": backups.get('va1_osi', {}).get('title', 'TRUCO para aprender 7 Capas del Modelo OSI (CCNA)'),
    "backupCanal": backups.get('va1_osi', {}).get('author', 'Pedro Lino Cáceres'),
    "backupYtId": backups.get('va1_osi', {}).get('vid', 'Qq2INjTO2nY'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va1_osi', {}).get('vid', 'Qq2INjTO2nY')}",
    "docOficial": {
      "titulo": "Cisco Systems: Referencia Formal del Modelo OSI",
      "url": "https://www.cisco.com/c/es_mx/support/docs/ip/routing-information-protocol-rip/13769-5.html",
      "desc": "Análisis comparativo de las 7 capas frente a la suite TCP/IP y unidades de datos PDU."
    },
    "herramientaWeb": {
      "titulo": "Wireshark Protocol Filters & Captures",
      "url": "https://www.wireshark.org/docs/dfref/",
      "desc": "Inspección de tramas Ethernet, paquetes IP y cabeceras de transporte TCP/UDP en vivo."
    },
    "descripcion": "Explicación exhaustiva del modelo de referencia OSI de 7 capas frente a la suite TCP/IP, análisis de PDU por capa (Bits, Tramas, Paquetes, Segmentos, Datos) y el proceso de encapsulación y desencapsulación.",
    "temasClave": ["Modelo OSI 7 Capas", "PDU por Capa", "TCP/IP vs OSI", "Encapsulamiento", "Cabeceras IP y TCP"]
  },
  {
    "id": "va2_dispositivos",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A3, A4, A5, A6, A7",
    "titulo": "Diferencias entre HUB, SWITCH y ROUTER explicado rápido y fácil!",
    "canal": "RedesCiber - Tu Academia de Redes y Ciberseguridad",
    "duracion": "35 min",
    "nivel": "Explicación a Fondo",
    "ytId": "Gky8-OVYmT4",
    "link": "https://www.youtube.com/watch?v=Gky8-OVYmT4",
    "backupTitulo": backups.get('va2_dispositivos', {}).get('title', 'Diferencia HUB vs SWITCH'),
    "backupCanal": backups.get('va2_dispositivos', {}).get('author', 'El Rincón de Cabra'),
    "backupYtId": backups.get('va2_dispositivos', {}).get('vid', 'siF_GOhq6ck'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va2_dispositivos', {}).get('vid', 'siF_GOhq6ck')}",
    "docOficial": {
      "titulo": "Cisco Catalyst: Tablas CAM/MAC y Dominios de Colisión",
      "url": "https://www.cisco.com/c/es_mx/support/docs/switches/catalyst-2900-xl-series-switches/10574-mac-table.html",
      "desc": "Conmutación en Capa 2 vs enrutamiento en Capa 3; aislamiento de colisión y broadcast."
    },
    "herramientaWeb": {
      "titulo": "Cisco Packet Tracer Lab Guides",
      "url": "https://learningnetwork.cisco.com/",
      "desc": "Simulación visual del aprendizaje de direcciones MAC y forwarding de paquetes."
    },
    "descripcion": "Diferenciación conceptual y operativa de dispositivos de interconexión. Tabla CAM/MAC en switches, tablas de ruteo en routers, segmentación de dominios de colisión frente a dominios de broadcast y microsegmentación.",
    "temasClave": ["Hub vs Switch", "Tabla MAC / CAM", "Router y Gateway", "Dominios de Colisión", "Dominios de Broadcast"]
  },
  {
    "id": "va4_medios",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A8, A9, A10, A11",
    "titulo": "Cables UTP Coaxial y Fibra Óptica",
    "canal": "David Urbano Zepeda Cruz",
    "duracion": "40 min",
    "nivel": "Explicación a Fondo",
    "ytId": "Afk_ZWaXL2w",
    "link": "https://www.youtube.com/watch?v=Afk_ZWaXL2w",
    "backupTitulo": backups.get('va4_medios', {}).get('title', 'UTP vs Fibra Óptica: La Batalla Definitiva'),
    "backupCanal": backups.get('va4_medios', {}).get('author', 'Helectror IT'),
    "backupYtId": backups.get('va4_medios', {}).get('vid', 'yatJ9QjiSTs'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va4_medios', {}).get('vid', 'yatJ9QjiSTs')}",
    "docOficial": {
      "titulo": "Estándar Oficial IEEE 802.3 y Normas TIA/EIA 568A/B",
      "url": "https://standards.ieee.org/",
      "desc": "Especificaciones técnicas de cableado par trenzado Cat 5e/6, coaxial y fibra óptica monomodo/multimodo."
    },
    "herramientaWeb": {
      "titulo": "Pinout y Código de Colores RJ-45",
      "url": "https://pinouts.ru/NetworkCables/ethernet_10_100_1000_pinout.shtml",
      "desc": "Diagrama de conexiones y esquemas directo vs cruzado según norma T568A/B."
    },
    "descripcion": "Propiedades físicas y eléctricas de los medios guiados y no guiados: Cable coaxial, par trenzado UTP y STP (normas TIA/EIA 568A y 568B), fibra óptica monomodo frente a multimodo y estándares Wi-Fi IEEE 802.11.",
    "temasClave": ["UTP Cat 5e/6", "Normas TIA/EIA 568A/B", "Fibra Monomodo vs Multimodo", "Cable Coaxial BNC", "Wi-Fi 802.11"]
  },
  {
    "id": "va3_subnetting",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A13, A14",
    "titulo": "Subnetting desde CERO | La forma FÁCIL de entenderlo para CCNA",
    "canal": "Pedro Lino Cáceres",
    "duracion": "1h 15 min",
    "nivel": "Clase Magistral Práctica",
    "ytId": "kIUIMUpXDrY",
    "link": "https://www.youtube.com/watch?v=kIUIMUpXDrY",
    "backupTitulo": backups.get('va3_subnetting', {}).get('title', 'Ejercicios VLSM resueltos paso a paso'),
    "backupCanal": backups.get('va3_subnetting', {}).get('author', 'ProfeSantiago'),
    "backupYtId": backups.get('va3_subnetting', {}).get('vid', 'g3vzBR5PR3o'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va3_subnetting', {}).get('vid', 'g3vzBR5PR3o')}",
    "docOficial": {
      "titulo": "IETF RFC 1918 & RFC 4632: CIDR y Rangos Privados",
      "url": "https://datatracker.ietf.org/doc/html/rfc1918",
      "desc": "Definición canónica de direcciones privadas 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16."
    },
    "herramientaWeb": {
      "titulo": "Subnet Calculator & VLSM Generator",
      "url": "https://www.subnet-calculator.com/",
      "desc": "Calculadora online de máscaras de red, número mágico, broadcast y hosts utilizables."
    },
    "descripcion": "Capacitación integral en direccionamiento IPv4 y subnetting: Notación CIDR, cálculo del número mágico, máscaras /24 a /30, fórmulas de subredes y hosts utilizables (2^h - 2), y metodología ordenada para VLSM.",
    "temasClave": ["Subnetting FLSM", "VLSM Paso a Paso", "Número Mágico", "IP de Red y Broadcast", "Rango Hosts Útiles"]
  },
  {
    "id": "va5_enrutamiento",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A15",
    "titulo": "Métrica de protocolos de routing, Métrica de RIP, Métrica de OSPF, Métrica de EIGRP",
    "canal": "Mastering IT",
    "duracion": "50 min",
    "nivel": "Masterclass Completa",
    "ytId": "aNkQXJ8rS4Q",
    "link": "https://www.youtube.com/watch?v=aNkQXJ8rS4Q",
    "backupTitulo": backups.get('va5_enrutamiento', {}).get('title', 'Protocolos de enrutamiento RIP, OSPF, EIGRP'),
    "backupCanal": backups.get('va5_enrutamiento', {}).get('author', 'NOCPERU Data Center'),
    "backupYtId": backups.get('va5_enrutamiento', {}).get('vid', '8M0EIb-PaVk'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va5_enrutamiento', {}).get('vid', '8M0EIb-PaVk')}",
    "docOficial": {
      "titulo": "Cisco: Distancias Administrativas y Algoritmos de Ruteo",
      "url": "https://www.cisco.com/c/es_mx/support/docs/ip/border-gateway-protocol-bgp/15894-admin-dist.html",
      "desc": "Prioridades: Conectada(0), Estática(1), EIGRP(90), OSPF(110), RIP(120). Vector Distancia vs Dijkstra SPF."
    },
    "herramientaWeb": {
      "titulo": "IETF RFC 2328: OSPF v2 Specification",
      "url": "https://datatracker.ietf.org/doc/html/rfc2328",
      "desc": "Texto formal del estándar del protocolo de estado de enlace y áreas jerárquicas."
    },
    "descripcion": "Fundamentos del ruteo en redes IP: Enrutamiento estático frente a dinámico. Comparativa rigurosa entre algoritmos de vector de distancia (RIP) y estado de enlace (OSPF con algoritmo Dijkstra SPF) y tabla de distancias administrativas.",
    "temasClave": ["Rutas Estáticas", "RIP vs OSPF", "Distancia Administrativa", "Algoritmo Dijkstra SPF", "Métrica de Saltos vs Costo"]
  },
  {
    "id": "va6_wan",
    "pilar": "A",
    "pilarName": "Pilar A: Redes",
    "puntos": "A16, A17",
    "titulo": "Tecnologias Networking WAN - HDLC-PPP-FRAME RELAY-ATM-FIBRA OPTICA",
    "canal": "Israel Gomez",
    "duracion": "38 min",
    "nivel": "Explicación a Fondo",
    "ytId": "AiyRFuEPiVY",
    "link": "https://www.youtube.com/watch?v=AiyRFuEPiVY",
    "backupTitulo": backups.get('va6_wan', {}).get('title', 'Red WAN Nube Frame Relay Packet Tracer'),
    "backupCanal": backups.get('va6_wan', {}).get('author', 'El profe García'),
    "backupYtId": backups.get('va6_wan', {}).get('vid', 'jTaJVtEUvqY'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('va6_wan', {}).get('vid', 'jTaJVtEUvqY')}",
    "docOficial": {
      "titulo": "Cisco IOS WAN: Configuración PPP, Frame Relay y HDLC",
      "url": "https://www.cisco.com/c/en/us/support/docs/dial-access/point-to-point-protocol-ppp/10200-auth-chap-pap.html",
      "desc": "Autenticación PAP de 2 vías vs CHAP de 3 vías con secreto compartido MD5."
    },
    "herramientaWeb": {
      "titulo": "IETF RFC 1661: The Point-to-Point Protocol (PPP)",
      "url": "https://datatracker.ietf.org/doc/html/rfc1661",
      "desc": "Protocolos LCP (enlace y autenticación) y NCP (encapsulación de Capa 3)."
    },
    "descripcion": "Estructura de redes WAN y protocolos de capa de enlace: Circuitos virtuales PVC/SVC, identificadores DLCI y LMI en Frame Relay; protocolo PPP con autenticación PAP y CHAP; y encapsulación HDLC estándar frente a Cisco.",
    "temasClave": ["Frame Relay (DLCI / LMI)", "Protocolo PPP", "Autenticación CHAP vs PAP", "Encapsulamiento HDLC", "Enlaces WAN"]
  },
  {
    "id": "vb1_ws_ad",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B1, B2, B4, B5",
    "titulo": "Curso de Microsoft Windows Server 2022 desde cero y para principiantes | INTRODUCCION",
    "canal": "INFORMATICONFIG",
    "duracion": "2h 30 min",
    "nivel": "Curso Magistral Completo",
    "ytId": "yuQATj2xTI8",
    "link": "https://www.youtube.com/watch?v=yuQATj2xTI8",
    "backupTitulo": backups.get('vb1_ws_ad', {}).get('title', '¿Qué es el Active Directory y para qué sirve?'),
    "backupCanal": backups.get('vb1_ws_ad', {}).get('author', 'AlbertoLopez TECH TIPS'),
    "backupYtId": backups.get('vb1_ws_ad', {}).get('vid', 'ZDFii9aI_O4'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb1_ws_ad', {}).get('vid', 'ZDFii9aI_O4')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Información General de Active Directory Domain Services",
      "url": "https://learn.microsoft.com/es-es/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview",
      "desc": "Instalación de roles AD DS, bosques, árboles, dominios y Unidades Organizativas (OU)."
    },
    "herramientaWeb": {
      "titulo": "Microsoft Evaluation Center: ISOs Oficiales de Prueba",
      "url": "https://www.microsoft.com/es-es/evalcenter/",
      "desc": "Entornos de laboratorio y máquinas virtuales oficiales de Windows Server."
    },
    "descripcion": "Implementación integral de Windows Server: Instalación del sistema operativo, promoción a Controlador de Dominio (AD DS), arquitectura de bosques, árboles y dominios, consola de Usuarios y Equipos de AD y directivas GPO.",
    "temasClave": ["Instalación Windows Server", "Promoción a DC (AD DS)", "Estructura Bosque y Árbol", "Usuarios y Equipos AD", "Directivas de Grupo (GPO)"]
  },
  {
    "id": "vb2_fsmo",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B2",
    "titulo": "Saber que DC contiene los 5 FSMO de Active Directory",
    "canal": "imvo2",
    "duracion": "35 min",
    "nivel": "Masterclass Técnica",
    "ytId": "GtrLpbGRbqM",
    "link": "https://www.youtube.com/watch?v=GtrLpbGRbqM",
    "backupTitulo": backups.get('vb2_fsmo', {}).get('title', 'Windows Server - Maestros de Operación o Roles FSMO'),
    "backupCanal": backups.get('vb2_fsmo', {}).get('author', 'EntrenamientoTI'),
    "backupYtId": backups.get('vb2_fsmo', {}).get('vid', 'VpSaclbMgKM'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb2_fsmo', {}).get('vid', 'VpSaclbMgKM')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Guía de Roles FSMO en Active Directory",
      "url": "https://learn.microsoft.com/es-es/troubleshoot/windows-server/active-directory/fsmo-roles",
      "desc": "Roles únicos por bosque (Schema, Domain Naming) y por dominio (PDC, RID, Infrastructure Master)."
    },
    "herramientaWeb": {
      "titulo": "Microsoft TechNet: Comandos netdom query fsmo",
      "url": "https://learn.microsoft.com/es-es/troubleshoot/windows-server/active-directory/identify-fsmo-role-holders",
      "desc": "Procedimiento de consulta y transferencia de roles mediante consola ntdsutil."
    },
    "descripcion": "Análisis minucioso de los 5 roles FSMO (Flexible Single Master Operation): Roles únicos a nivel bosque (Schema Master y Domain Naming Master) y roles de dominio (PDC Emulator, RID Master e Infrastructure Master) más Catálogo Global (GC).",
    "temasClave": ["Schema Master", "Domain Naming Master", "PDC Emulator", "RID Master", "Infrastructure Master", "Catálogo Global"]
  },
  {
    "id": "vb3_sitios_replicacion",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B3",
    "titulo": "Replicacion InterSite e IntraSite con Windows Server 2016",
    "canal": "RJC265",
    "duracion": "40 min",
    "nivel": "Explicación a Fondo",
    "ytId": "21i4bKuDPsA",
    "link": "https://www.youtube.com/watch?v=21i4bKuDPsA",
    "backupTitulo": backups.get('vb3_sitios_replicacion', {}).get('title', '¿Qué es ACTIVE DIRECTORY y Sitios?'),
    "backupCanal": backups.get('vb3_sitios_replicacion', {}).get('author', 'RINKU'),
    "backupYtId": backups.get('vb3_sitios_replicacion', {}).get('vid', 'rSNX7GEc30E'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb3_sitios_replicacion', {}).get('vid', 'rSNX7GEc30E')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Diseño de Topología de Sitios y Replicación",
      "url": "https://learn.microsoft.com/es-es/windows-server/identity/ad-ds/plan/active-directory-site-topology-design",
      "desc": "Subredes IP, algoritmo KCC (Knowledge Consistency Checker), anillo de replicación y enlaces de sitio."
    },
    "herramientaWeb": {
      "titulo": "Diagnóstico de Replicación: repadmin /showrepl",
      "url": "https://learn.microsoft.com/es-es/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc770984(v=ws.11)",
      "desc": "Utilidades de línea de comandos de Active Directory para verificación de consistencia."
    },
    "descripcion": "Topología física de Active Directory: Definición de Sitios basada en subredes IP, rol del KCC en la generación del anillo de replicación, y diferencias entre replicación intrasitio (RPC/IP inmediata) e intersitio con costos y programación.",
    "temasClave": ["Sitios y Subredes", "KCC Anillo de Replicación", "Replicación Intrasitio", "Replicación Intersitio", "Costos y Enlaces de Sitio"]
  },
  {
    "id": "vb4_agdlp_ntfs",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B4, B5, B7, B8",
    "titulo": "compartir carpeta y permisos NTFS",
    "canal": "Abraham Batista",
    "duracion": "35 min",
    "nivel": "Clase Magistral de Seguridad",
    "ytId": "z2wz8DUgdds",
    "link": "https://www.youtube.com/watch?v=z2wz8DUgdds",
    "backupTitulo": backups.get('vb4_agdlp_ntfs', {}).get('title', 'Interfaz de permisos NTFS en Windows Server'),
    "backupCanal": backups.get('vb4_agdlp_ntfs', {}).get('author', 'Universitat Politècnica de València - UPV'),
    "backupYtId": backups.get('vb4_agdlp_ntfs', {}).get('vid', 'lYn8cZ5XpR0'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb4_agdlp_ntfs', {}).get('vid', 'lYn8cZ5XpR0')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Estrategia de Asignación de Permisos AGDLP",
      "url": "https://learn.microsoft.com/es-es/windows-server/identity/ad-ds/plan/creating-a-resource-domain-strategy",
      "desc": "Accounts -> Global Groups -> Domain Local Groups -> Permissions. Regla de permisos más restrictivos."
    },
    "herramientaWeb": {
      "titulo": "Microsoft TechNet: Permisos NTFS vs Compartidos",
      "url": "https://learn.microsoft.com/es-es/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc754178(v=ws.10)",
      "desc": "Herencia de permisos, denegación explícita y cálculo de permisos efectivos por red."
    },
    "descripcion": "Implementación práctica de la regla AGDLP de Microsoft: Accounts en Global groups, estos en Domain Local groups, y a estos se asignan los Permissions. Cálculo de permisos efectivos por red (el más restrictivo entre Share y NTFS).",
    "temasClave": ["Estrategia AGDLP", "Permisos NTFS", "Permisos Compartidos (Share)", "Permisos Más Restrictivos", "Herencia y Bloqueo"]
  },
  {
    "id": "vb5_impresoras",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B6, B9",
    "titulo": "Servidor de Impresion - Windows Server 2016 2022",
    "canal": "JSVitonas",
    "duracion": "30 min",
    "nivel": "Explicación a Fondo",
    "ytId": "djK0uwngQn8",
    "link": "https://www.youtube.com/watch?v=djK0uwngQn8",
    "backupTitulo": backups.get('vb5_impresoras', {}).get('title', 'Configurar printer pooling en Windows Server'),
    "backupCanal": backups.get('vb5_impresoras', {}).get('author', 'Santiago Bermejo Ruiz'),
    "backupYtId": backups.get('vb5_impresoras', {}).get('vid', 'ACiBnr_CWu8'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb5_impresoras', {}).get('vid', 'ACiBnr_CWu8')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Rol Servidor de Impresión y Print Spooler",
      "url": "https://learn.microsoft.com/es-es/windows-server/administration/windows-commands/print",
      "desc": "Aislamiento de controladores, colas de impresión y directivas de grupo para despliegue de impresoras."
    },
    "herramientaWeb": {
      "titulo": "Guía Oficial de Agrupación de Impresoras (Printer Pooling)",
      "url": "https://learn.microsoft.com/es-es/troubleshoot/windows-server/printing/set-up-printer-pooling",
      "desc": "Un único objeto lógico que balancea trabajos entre múltiples puertos e impresoras idénticas."
    },
    "descripcion": "Arquitectura del servidor de impresión en Windows: Servicio Print Spooler, aislamiento de controladores, creación de pools de impresoras (un único objeto lógico que balancea entre varios dispositivos físicos) y prioridades de impresión (1-99).",
    "temasClave": ["Print Spooler", "Colas de Impresión", "Pooling de Impresoras", "Prioridades de Impresión (1-99)", "Permisos de Impresora"]
  },
  {
    "id": "vb6_servicios_red",
    "pilar": "B",
    "pilarName": "Pilar B: Windows Server & AD",
    "puntos": "B10, B11, B12, B13, B14, B15, B16, B17",
    "titulo": "Cómo instalar y configurar DHCP y DNS - Curso de Windows Server",
    "canal": "Edutin Academy",
    "duracion": "1h 10 min",
    "nivel": "Masterclass Completa",
    "ytId": "nSUl7bLUybc",
    "link": "https://www.youtube.com/watch?v=nSUl7bLUybc",
    "backupTitulo": backups.get('vb6_servicios_red', {}).get('title', 'Servidor DHCP, DNS y Active Directory en Windows Server'),
    "backupCanal": backups.get('vb6_servicios_red', {}).get('author', 'Rubén Pasiche'),
    "backupYtId": backups.get('vb6_servicios_red', {}).get('vid', 'zqKKGS7yD0Y'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vb6_servicios_red', {}).get('vid', 'zqKKGS7yD0Y')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Servidor DNS y DHCP en Windows Server",
      "url": "https://learn.microsoft.com/es-es/windows-server/networking/dns/dns-top",
      "desc": "Zonas directas/inversas en AD, ciclo DORA (Discover, Offer, Request, Ack) y opciones 003, 006, 015."
    },
    "herramientaWeb": {
      "titulo": "Microsoft Learn: Distributed File System (DFS)",
      "url": "https://learn.microsoft.com/es-es/windows-server/storage/dfs-namespaces/dfs-overview",
      "desc": "Namespaces distribuidos y motor de replicación diferencial remota (DFSR)."
    },
    "descripcion": "Servicios esenciales de infraestructura: Zonas DNS directas e inversas integradas en AD; servidor DHCP con ciclo DORA, opciones 003, 006, 015 y reservas MAC; resolución NetBIOS con WINS; túneles VPN RRAS (IPSec), RADIUS (NPS) y DFS.",
    "temasClave": ["DNS Integrado en AD", "DHCP (Ciclo DORA)", "WINS NetBIOS", "VPN RRAS e IPSec", "RADIUS (NPS)", "DFS Namespaces y Replicación"]
  },
  {
    "id": "vc1_uml",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C1",
    "titulo": "¿Qué es UML?",
    "canal": "TodoCode",
    "duracion": "1h 30 min",
    "nivel": "Curso Magistral Completo",
    "ytId": "OvdtyLDDK_Y",
    "link": "https://www.youtube.com/watch?v=OvdtyLDDK_Y",
    "backupTitulo": backups.get('vc1_uml', {}).get('title', 'DIAGRAMAS UML EN 1 MINUTO!'),
    "backupCanal": backups.get('vc1_uml', {}).get('author', 'TodoCode'),
    "backupYtId": backups.get('vc1_uml', {}).get('vid', 'wEw0Ny-pZR8'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc1_uml', {}).get('vid', 'wEw0Ny-pZR8')}",
    "docOficial": {
      "titulo": "UML-Diagrams.org: Guía de Referencia Formal UML 2.5",
      "url": "https://www.uml-diagrams.org/",
      "desc": "Diagramas de Clases, Casos de Uso, Secuencia y sintaxis de relaciones (agregación, composición, herencia)."
    },
    "herramientaWeb": {
      "titulo": "PlantUML Online Web Server",
      "url": "https://www.plantuml.com/plantuml/uml/",
      "desc": "Editor y renderizador online en tiempo real de diagramas UML mediante texto plano."
    },
    "descripcion": "Capacitación en UML: Diagramas estructurales (Clases, Objetos, Componentes) y de comportamiento (Casos de Uso, Secuencia, Actividades). Sintaxis de atributos y métodos, multiplicidades y relaciones: Asociación, Agregación, Composición y Herencia.",
    "temasClave": ["Diagramas de Clases", "Casos de Uso", "Diagramas de Secuencia", "Agregación vs Composición", "Herencia y Generalización"]
  },
  {
    "id": "vc2_compiladores",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C2",
    "titulo": "Lenguajes Compilados vs Lenguajes Interpretados",
    "canal": "EDteam",
    "duracion": "35 min",
    "nivel": "Explicación a Fondo",
    "ytId": "JWrwnWD9E1M",
    "link": "https://www.youtube.com/watch?v=JWrwnWD9E1M",
    "backupTitulo": backups.get('vc2_compiladores', {}).get('title', 'Lenguajes compilados VS interpretados'),
    "backupCanal": backups.get('vc2_compiladores', {}).get('author', 'EDteam'),
    "backupYtId": backups.get('vc2_compiladores', {}).get('vid', 'v-CDoKysZb4'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc2_compiladores', {}).get('vid', 'v-CDoKysZb4')}",
    "docOficial": {
      "titulo": "GNU Compiler Collection (GCC): Fases de Compilación",
      "url": "https://gcc.gnu.org/onlinedocs/",
      "desc": "Análisis léxico, sintáctico (AST), semántico, generación de código objeto y enlazado de librerías."
    },
    "herramientaWeb": {
      "titulo": "Compiler Explorer (Godbolt.org)",
      "url": "https://godbolt.org/",
      "desc": "Inspección interactiva de la traducción de código C/C++ a ensamblador y código máquina."
    },
    "descripcion": "Transformación de código fuente a ejecutable: Compaginadores/Linkers con enlace estático (.lib/.a) frente a dinámico (.dll/.so); ensambladores; fases de un compilador (léxico, sintáctico, semántico, optimización) e intérpretes.",
    "temasClave": ["Compiladores vs Intérpretes", "Enlazadores (Linkers)", "Ensamblador y Código Máquina", "Fases de Compilación", "Enlace Estático vs Dinámico"]
  },
  {
    "id": "vc3_historia_paradigmas",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C3, C5",
    "titulo": "¿Qué son los paradigmas de programación?",
    "canal": "EDteam",
    "duracion": "45 min",
    "nivel": "Clase Magistral Histórica",
    "ytId": "hcuvB58hwlE",
    "link": "https://www.youtube.com/watch?v=hcuvB58hwlE",
    "backupTitulo": backups.get('vc3_historia_paradigmas', {}).get('title', 'Paradigmas de programación'),
    "backupCanal": backups.get('vc3_historia_paradigmas', {}).get('author', 'LG7 multimedia'),
    "backupYtId": backups.get('vc3_historia_paradigmas', {}).get('vid', 'T7nlIInHTco'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc3_historia_paradigmas', {}).get('vid', 'T7nlIInHTco')}",
    "docOficial": {
      "titulo": "Computer History Museum: Cronología de Lenguajes",
      "url": "https://www.computerhistory.org/",
      "desc": "Hitos de FORTRAN (1957), LISP (1958), COBOL (1959), Algol 60, Pascal y C."
    },
    "herramientaWeb": {
      "titulo": "Stanford Encyclopedia: Computer Programming Paradigms",
      "url": "https://plato.stanford.edu/entries/computer-science/",
      "desc": "Fundamentos teóricos de paradigmas imperativo, orientado a objetos, funcional y lógico."
    },
    "descripcion": "Cronología de las generaciones de lenguajes: FORTRAN (1957), LISP (1958), COBOL (1959), Pascal y C. Explicación de los 6 paradigmas: Imperativo, Orientado a Objetos, Funcional, Lógico (Prolog), Concurrente y Declarativo.",
    "temasClave": ["Historia FORTRAN / LISP / COBOL", "Paradigmas de Programación", "Paradigma Funcional", "Paradigma Lógico (Prolog)", "POO y Concurrencia"]
  },
  {
    "id": "vc4_estructurada",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C4",
    "titulo": "Lógica de Programación: 74 La Programación Estructurada Según Edsger Wybe Dijkstra",
    "canal": "Ingeniero John Ortiz Ordoñez",
    "duracion": "30 min",
    "nivel": "Explicación a Fondo",
    "ytId": "e_8utUe9ghg",
    "link": "https://www.youtube.com/watch?v=e_8utUe9ghg",
    "backupTitulo": backups.get('vc4_estructurada', {}).get('title', 'Comprendiendo el Teorema de Böhm y Jacopini'),
    "backupCanal": backups.get('vc4_estructurada', {}).get('author', 'Ingeniero John Ortiz Ordoñez'),
    "backupYtId": backups.get('vc4_estructurada', {}).get('vid', '_75msS219xc'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc4_estructurada', {}).get('vid', '_75msS219xc')}",
    "docOficial": {
      "titulo": "Edsger W. Dijkstra (1968): Go To Statement Considered Harmful",
      "url": "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      "desc": "El paper histórico que fundó la programación estructurada y la eliminación de saltos incondicionales."
    },
    "herramientaWeb": {
      "titulo": "Teorema de Böhm-Jacopini: Demostración y Síntesis",
      "url": "https://en.wikipedia.org/wiki/Structured_program_theorem",
      "desc": "Teorema formal de completitud con solo secuencia, selección if-else e iteración while."
    },
    "descripcion": "Fundamentos teóricos de la programación estructurada: El Teorema de Böhm-Jacopini (secuencia, selección if-else, iteración while), la eliminación del GOTO de Dijkstra, diseño modular top-down, cohesión interna y bajo acoplamiento.",
    "temasClave": ["Teorema de Böhm-Jacopini", "Eliminación del GOTO", "Secuencia, Selección, Iteración", "Modularidad y Cohesión", "Bajo Acoplamiento"]
  },
  {
    "id": "vc5_web_dom",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C6, C7, C8",
    "titulo": "Que es el DOM - JavaScript",
    "canal": "DOCUMENT 0",
    "duracion": "45 min",
    "nivel": "Clase Magistral de Arquitectura",
    "ytId": "Jh-LUQMwtRk",
    "link": "https://www.youtube.com/watch?v=Jh-LUQMwtRk",
    "backupTitulo": backups.get('vc5_web_dom', {}).get('title', '¿Qué es el DOM? | Curso JAVASCRIPT DESDE CERO'),
    "backupCanal": backups.get('vc5_web_dom', {}).get('author', 'TodoCode'),
    "backupYtId": backups.get('vc5_web_dom', {}).get('vid', '4ILE0y58J00'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc5_web_dom', {}).get('vid', '4ILE0y58J00')}",
    "docOficial": {
      "titulo": "MDN Web Docs: Document Object Model (DOM)",
      "url": "https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction",
      "desc": "Árbol de nodos, manipulación dinámica con JavaScript, APIs del DOM y manejo de eventos."
    },
    "herramientaWeb": {
      "titulo": "MDN Web Docs: Guía Completa de Protocolo HTTP",
      "url": "https://developer.mozilla.org/es/docs/Web/HTTP",
      "desc": "Arquitectura cliente-servidor web, métodos GET/POST y códigos de estado HTTP 1xx-5xx."
    },
    "descripcion": "Nacimiento de la World Wide Web en el CERN (Tim Berners-Lee), protocolo HTTP cliente-servidor, estructura de HTML semántico, árbol del DOM (Document Object Model), manipulación dinámica con JavaScript y tecnologías DHTML.",
    "temasClave": ["Nacimiento de la Web (CERN)", "Protocolo HTTP", "Árbol del DOM", "JavaScript en el Cliente", "DHTML Clásico"]
  },
  {
    "id": "vc6_backend_php_asp",
    "pilar": "C",
    "pilarName": "Pilar C: Desarrollo & Web",
    "puntos": "C9, C10",
    "titulo": "Curso PHP MySQL. Presentación. Vídeo 1",
    "canal": "pildorasinformaticas",
    "duracion": "1h 45 min",
    "nivel": "Masterclass Comparativa",
    "ytId": "I75CUdSJifw",
    "link": "https://www.youtube.com/watch?v=I75CUdSJifw",
    "backupTitulo": backups.get('vc6_backend_php_asp', {}).get('title', 'Cómo trabajar con sesiones en PHP - Guía completa'),
    "backupCanal": backups.get('vc6_backend_php_asp', {}).get('author', '¿Eres más listo que la IA?'),
    "backupYtId": backups.get('vc6_backend_php_asp', {}).get('vid', '931_8cUURrs'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vc6_backend_php_asp', {}).get('vid', '931_8cUURrs')}",
    "docOficial": {
      "titulo": "Manual Oficial de PHP: Variables Superglobales",
      "url": "https://www.php.net/manual/es/language.variables.superglobals.php",
      "desc": "Uso de $_GET, $_POST, $_SESSION, session_start() y acceso a bases de datos relacionales."
    },
    "herramientaWeb": {
      "titulo": "Microsoft IIS: Referencia de Objetos de ASP Clásico",
      "url": "https://learn.microsoft.com/es-es/previous-versions/iis/6.0-sdk/ms525396(v=vs.90)",
      "desc": "Objetos intrínsecos: Application (global), Session (usuario), Server y conexiones ADODB."
    },
    "descripcion": "Desarrollo del lado del servidor: Pila LAMP con PHP y MySQL (variables superglobales $_POST, $_GET, sesiones session_start(), mysqli_connect); frente a la arquitectura Microsoft IIS con ASP Clásico (Application, Session, Request, Response, Server y ADODB).",
    "temasClave": ["PHP + MySQL Procedural", "Sesiones y Variables Superglobales", "ASP Clásico con VBScript", "Objetos Application y Session", "Acceso a Datos ADODB"]
  },
  {
    "id": "vd1_mer",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D1, D2, D3, D4, D5",
    "titulo": "Cardinalidad en Base de Datos | Aprende Todo sobre Las Cardinalidades",
    "canal": "Informatico sin limites",
    "duracion": "55 min",
    "nivel": "Clase Magistral de Diseño",
    "ytId": "7XnGypgLxvc",
    "link": "https://www.youtube.com/watch?v=7XnGypgLxvc",
    "backupTitulo": backups.get('vd1_mer', {}).get('title', 'Curso modelo entidad relacion (MER)'),
    "backupCanal": backups.get('vd1_mer', {}).get('author', 'DiscoDurodeRoer'),
    "backupYtId": backups.get('vd1_mer', {}).get('vid', 'J-zum0Z96g4'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vd1_mer', {}).get('vid', 'J-zum0Z96g4')}",
    "docOficial": {
      "titulo": "Peter P. Chen (1976): The Entity-Relationship Model (ACM)",
      "url": "https://dl.acm.org/doi/10.1145/320434.320440",
      "desc": "El documento fundacional del modelado conceptual: Entidades fuertes, débiles, atributos y cardinalidades."
    },
    "herramientaWeb": {
      "titulo": "Draw.io: Editor Visual de Diagramas Entidad-Relación",
      "url": "https://app.diagrams.net/",
      "desc": "Plantillas estándar de notación Chen y patas de gallo (crow's foot) para diseño de bases de datos."
    },
    "descripcion": "Fases formales del diseño de bases de datos (Conceptual, Lógico y Físico). Modelado E-R: Entidades fuertes y débiles, atributos simples, compuestos y multivaluados, grado de la relación, cardinalidad (1:1, 1:N, N:M) y reducción a tablas relacionales.",
    "temasClave": ["Etapas del Diseño de BD", "Modelo E-R Completo", "Grado de la Relación", "Cardinalidad (1:1, 1:N, N:M)", "Reducción a Tablas Relacionales"]
  },
  {
    "id": "vd2_relacional",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D6",
    "titulo": "02 - El Modelo Relacional - Integridad referencial",
    "canal": "Alejandro Mainero",
    "duracion": "40 min",
    "nivel": "Explicación a Fondo",
    "ytId": "RHxh8ATzmO0",
    "link": "https://www.youtube.com/watch?v=RHxh8ATzmO0",
    "backupTitulo": backups.get('vd2_relacional', {}).get('title', 'Las 12 Reglas de Codd: Modelo Relacional'),
    "backupCanal": backups.get('vd2_relacional', {}).get('author', 'Percy Tech'),
    "backupYtId": backups.get('vd2_relacional', {}).get('vid', 'zC_Uj3zCETg'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vd2_relacional', {}).get('vid', 'zC_Uj3zCETg')}",
    "docOficial": {
      "titulo": "Edgar F. Codd (1970): Relational Model for Large Shared Data Banks",
      "url": "https://dl.acm.org/doi/10.1145/362384.362685",
      "desc": "Teoría matemática relacional: Relaciones, tuplas, atributos atómicos e integridad referencial y de entidad."
    },
    "herramientaWeb": {
      "titulo": "PostgreSQL Documentation: Constraints & Foreign Keys",
      "url": "https://www.postgresql.org/docs/current/ddl-constraints.html",
      "desc": "Implementación práctica de restricciones PRIMARY KEY, FOREIGN KEY, ON DELETE CASCADE."
    },
    "descripcion": "Fundamentos formales del modelo relacional de Codd: Estructura de relaciones (tablas), tuplas, atributos y dominios atómicos. Clave Primaria (PK), Clave Foránea (FK), Claves Candidatas y Reglas de Integridad (de Entidad y Referencial).",
    "temasClave": ["Estructura Relacional", "Dominios y Tuplas", "Clave Primaria (PK) y Foránea (FK)", "Integridad de Entidad", "Integridad Referencial"]
  },
  {
    "id": "vd3_normalizacion_1_3",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D7",
    "titulo": "Normalización de bases de datos",
    "canal": "Jesús Domínguez Gutú",
    "duracion": "1h 00 min",
    "nivel": "Masterclass Práctica",
    "ytId": "QUWrKd9vK28",
    "link": "https://www.youtube.com/watch?v=QUWrKd9vK28",
    "backupTitulo": backups.get('vd3_normalizacion_1_3', {}).get('title', '¿Qué es la NORMALIZACIÓN de una BASE DE DATOS? 1FN 2FN 3FN'),
    "backupCanal": backups.get('vd3_normalizacion_1_3', {}).get('author', 'Ericka Zavala'),
    "backupYtId": backups.get('vd3_normalizacion_1_3', {}).get('vid', 'J8dviCaEa0M'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vd3_normalizacion_1_3', {}).get('vid', 'J8dviCaEa0M')}",
    "docOficial": {
      "titulo": "Microsoft Learn: Fundamentos de Normalización de Bases de Datos",
      "url": "https://learn.microsoft.com/es-es/office/troubleshoot/access/database-normalization-description",
      "desc": "Dependencias funcionales, 1FN (atomicidad), 2FN (sin dependencias parciales) y 3FN (sin dependencias transitivas)."
    },
    "herramientaWeb": {
      "titulo": "Módulo Interactivo de Normalización (Plataforma CMN)",
      "url": "#normalizacion",
      "desc": "Práctica guiada paso a paso de reducción formal hasta BCNF integrada en esta plataforma."
    },
    "descripcion": "Metodología completa de normalización con ejercicios prácticos: Dependencias funcionales, atributos primos, 1FN (atomicidad), 2FN (sin dependencias parciales), 3FN (sin dependencias transitivas) y BCNF (determinante superclave).",
    "temasClave": ["Dependencias Funcionales", "1FN (Atomicidad)", "2FN (Sin Dependencias Parciales)", "3FN (Sin Dependencias Transitivas)", "Forma Normal de Boyce-Codd (BCNF)"]
  },
  {
    "id": "vd4_normalizacion_4_5",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D7",
    "titulo": "Tema 4B : Dependencias Multivaluadas - 4FN y 5 FN",
    "canal": "MAURICIO LOPEZ BENITEZ",
    "duracion": "45 min",
    "nivel": "Masterclass Avanzada",
    "ytId": "DRV9_uM6sts",
    "link": "https://www.youtube.com/watch?v=DRV9_uM6sts",
    "backupTitulo": backups.get('vd4_normalizacion_4_5', {}).get('title', 'Normalización Avanzada: El Poder de la 4FN y 5FN'),
    "backupCanal": backups.get('vd4_normalizacion_4_5', {}).get('author', 'AulaTech FP'),
    "backupYtId": backups.get('vd4_normalizacion_4_5', {}).get('vid', 'K5eaxwjAeSc'),
    "backupLink": f"https://www.youtube.com/watch?v={backups.get('vd4_normalizacion_4_5', {}).get('vid', 'K5eaxwjAeSc')}",
    "docOficial": {
      "titulo": "Ronald Fagin (1977 IBM Research): Multivalued Dependencies and 4NF/5NF",
      "url": "https://researcher.watson.ibm.com/researcher/files/us-fagin/tods77.pdf",
      "desc": "El paper original sobre dependencias multivaluadas (MVD: X ->> Y) y Teorema de Fagin para 5FN."
    },
    "herramientaWeb": {
      "titulo": "Stanford CS145: Advanced Normal Forms Lecture Notes",
      "url": "https://cs145-stanford.github.io/",
      "desc": "Apuntes universitarios sobre proyección-unión (PJNF) y anomalías por productos cartesianos."
    },
    "descripcion": "Estudio de las formas normales superiores: 4FN mediante la eliminación de dependencias multivaluadas no triviales (MVD: X ->> Y) evitando redundancias cartesianas; y 5FN (Proyección-Unión / PJNF) con el Teorema de Fagin.",
    "temasClave": ["Dependencias Multivaluadas (MVD)", "4FN Paso a Paso", "5FN / PJNF", "Dependencias de Unión (Join)", "Teorema de Fagin"]
  },
  {
    "id": "vd5_sql_curso",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D8, D9, D10",
    "titulo": "Curso de SQL desde CERO (Completo) | Consultas, JOINs, Subconsultas y Bases de Datos",
    "canal": "Jeff Aporta",
    "duracion": "3h 00 min",
    "nivel": "Curso Magistral Completo",
    "ytId": "MZWI0AZcfG4",
    "link": "https://www.youtube.com/watch?v=MZWI0AZcfG4",
    "backupTitulo": "Curso de SQL desde CERO (Completo)",
    "backupCanal": "MoureDev by Brais Moure",
    "backupYtId": "DFg1V-rO6Pg",
    "backupLink": "https://www.youtube.com/watch?v=DFg1V-rO6Pg",
    "docOficial": {
      "titulo": "W3Schools SQL Tutorial & References",
      "url": "https://www.w3schools.com/sql/",
      "desc": "Guía práctica de DDL (CREATE, ALTER, DROP), DML (INSERT, UPDATE, DELETE), WHERE, GROUP BY, HAVING y JOINs."
    },
    "herramientaWeb": {
      "titulo": "SQL Fiddle: Consola SQL Interactiva",
      "url": "https://sqlfiddle.com/",
      "desc": "Crea esquemas, inserta registros y prueba consultas en línea sin instalar servidores locales."
    },
    "descripcion": "Capacitación exhaustiva en SQL: DDL (CREATE, ALTER, DROP con restricciones PK, FK, CHECK, UNIQUE), DML (INSERT, UPDATE, DELETE), consultas SELECT avanzadas, agrupamiento GROUP BY y HAVING, y todos los tipos de JOINs.",
    "temasClave": ["DDL (CREATE, ALTER, DROP)", "DML (INSERT, UPDATE, DELETE)", "Todos los JOINs Explicados", "GROUP BY y HAVING", "Subconsultas Correlacionadas"]
  },
  {
    "id": "vd6_tsql_avanzado",
    "pilar": "D",
    "pilarName": "Pilar D: Bases de Datos & SQL",
    "puntos": "D11, D12",
    "titulo": "SQL Avanzado: Procedimientos, Triggers y Vistas para una Base de Datos Eficiente",
    "canal": "AnalíticaEnAcción",
    "duracion": "1h 15 min",
    "nivel": "Masterclass Avanzada 100% en Español",
    "ytId": "nMw9YnpcmW8",
    "link": "https://www.youtube.com/watch?v=nMw9YnpcmW8",
    "backupTitulo": "Ejemplos de vistas, funciones, procedimientos y Triggers en SQL Server",
    "backupCanal": "UskoKruM2010 / Formación Técnica",
    "backupYtId": "JN1xcKXb4kM",
    "backupLink": "https://www.youtube.com/watch?v=JN1xcKXb4kM",
    "docOficial": {
      "titulo": "Microsoft Learn: Referencia Completa del Lenguaje Transact-SQL (T-SQL)",
      "url": "https://learn.microsoft.com/es-es/sql/t-sql/language-reference",
      "desc": "Documentación oficial de CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER (tablas inserted/deleted) e índices Clustered."
    },
    "herramientaWeb": {
      "titulo": "DB-Fiddle: Entorno SQL Server / PostgreSQL Online",
      "url": "https://db-fiddle.com/",
      "desc": "Prueba en vivo de procedimientos almacenados, triggers y vistas en el navegador."
    },
    "descripcion": "Objetos programables en SQL Server: Vistas (CREATE VIEW, ventajas y restricciones), Procedimientos Almacenados con parámetros INPUT/OUTPUT, Triggers DML (tablas inserted y deleted) e Índices Clustered frente a Non-Clustered.",
    "temasClave": ["Vistas (CREATE VIEW)", "Stored Procedures con Parámetros", "Triggers (AFTER / INSTEAD OF)", "Tablas Inserted y Deleted", "Índices Clustered vs Non-Clustered"]
  }
]

# Convert videos_data to formatted JavaScript
videos_js = json.dumps(videos_data, indent=2, ensure_ascii=False)

# Replacement block for VIDEOS array in index.html
new_videoteca_js = f"""/* ==================== VIDEOTECA MAGISTRAL DATA ==================== */
const VIDEOS = {videos_js};

/* ==================== VIDEOTECA MAGISTRAL METHODS ==================== */
app.videoFiltro = 'ALL';
app.videoBusqueda = '';
app.currentVideo = null;
app.embedProvider = 'standard'; // 'standard' (youtube.com) or 'nocookie' (youtube-nocookie.com)

app.toggleEmbedMode = function() {{
  if (!app.currentVideo) return;
  app.embedProvider = (app.embedProvider === 'standard') ? 'nocookie' : 'standard';
  const base = (app.embedProvider === 'nocookie') ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/';
  const ifr = document.getElementById('videoIframe');
  if (ifr) {{
    ifr.src = `${{base}}${{app.currentVideo.ytId}}?autoplay=1&rel=0&enablejsapi=1`;
    app.toast(`Reproductor cambiado a servidor: ${{app.embedProvider === 'nocookie' ? 'YouTube No-Cookie' : 'YouTube Estándar'}}`);
  }}
}};

app.renderVideoteca = function(pilarFiltro, textoBusqueda) {{
  if (pilarFiltro !== undefined) app.videoFiltro = pilarFiltro;
  if (textoBusqueda !== undefined) app.videoBusqueda = textoBusqueda;

  const cont = document.getElementById('videoCardsGrid');
  const countLbl = document.getElementById('videoResultsCount');
  if (!cont) return;

  const fPilar = app.videoFiltro || 'ALL';
  const query = (app.videoBusqueda || '').toLowerCase().trim();

  const filtrados = VIDEOS.filter(v => {{
    const matchPilar = (fPilar === 'ALL' || v.pilar === fPilar);
    if (!matchPilar) return false;
    if (!query) return true;
    const matchTxt = (
      v.titulo.toLowerCase().includes(query) ||
      v.canal.toLowerCase().includes(query) ||
      v.descripcion.toLowerCase().includes(query) ||
      v.puntos.toLowerCase().includes(query) ||
      v.temasClave.some(t => t.toLowerCase().includes(query)) ||
      (v.backupTitulo && v.backupTitulo.toLowerCase().includes(query)) ||
      (v.docOficial && v.docOficial.titulo.toLowerCase().includes(query))
    );
    return matchTxt;
  }});

  if (countLbl) {{
    countLbl.textContent = `Mostrando ${{filtrados.length}} de ${{VIDEOS.length}} clases magistrales seleccionadas` + (query ? ` para "${{app.videoBusqueda}}"` : '');
  }}

  // Actualizar botones de filtro
  document.querySelectorAll('#videoPilarFilters .filter-btn').forEach(btn => {{
    if (btn.dataset.pilar === fPilar) {{
      btn.classList.add('active', 'btn-primary');
    }} else {{
      btn.classList.remove('active', 'btn-primary');
    }}
  }});

  if (filtrados.length === 0) {{
    cont.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:36px 16px; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius);">
        <div style="font-size:14px; font-weight:600; color:var(--text); margin-bottom:6px;">No se encontraron videos para esta búsqueda</div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">Prueba buscando otros términos (ej: FSMO, Subneteo, 4FN, Böhm, AGDLP) o restablece los filtros.</div>
        <button class="btn btn-sm btn-primary" onclick="app.filtrarVideos('ALL')">Ver todos los videos</button>
      </div>
    `;
    return;
  }}

  cont.innerHTML = filtrados.map(v => {{
    return `
      <div class="video-card">
        <div class="video-card-top">
          <div class="video-card-header">
            <span class="video-pilar-badge badge-pilar-${{v.pilar}}">${{v.pilarName}}</span>
            <span class="video-duration">⏱ ${{v.duracion}}</span>
          </div>
          <div class="video-title">${{v.titulo}}</div>
          <div class="video-channel">
            <svg style="width:14px; height:14px; flex-shrink:0; color:#ef4444;" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            ${{v.canal}} &bull; <span style="color:var(--text-dim); font-size:10px;">${{v.nivel}}</span>
          </div>
          <div class="video-desc">${{v.descripcion}}</div>
          <div class="video-tags">
            ${{v.temasClave.map(t => `<span class="video-tag">${{t}}</span>`).join('')}}
          </div>

          <!-- RECURSOS TÉCNICOS ASOCIADOS -->
          <div class="video-resources-box">
            <div style="font-size:9.5px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.04em;">Recursos y Enlaces Oficiales:</div>
            ${{v.docOficial ? `
              <a class="video-resource-link" href="${{v.docOficial.url}}" target="_blank" rel="noopener" title="${{v.docOficial.desc}}">
                <span>📖</span> <span>${{v.docOficial.titulo}} ↗</span>
              </a>
            ` : ''}}
            ${{v.herramientaWeb ? `
              <a class="video-resource-link" href="${{v.herramientaWeb.url}}" target="_blank" rel="noopener" title="${{v.herramientaWeb.desc}}">
                <span>🛠</span> <span>${{v.herramientaWeb.titulo}} ↗</span>
              </a>
            ` : ''}}
            ${{v.backupLink ? `
              <a class="video-resource-link" href="${{v.backupLink}}" target="_blank" rel="noopener" style="color:#f59e0b;" title="Canal: ${{v.backupCanal}}">
                <span>🔄</span> <span>Alt: ${{v.backupTitulo}} (${{v.backupCanal}}) ↗</span>
              </a>
            ` : ''}}
          </div>
        </div>

        <div>
          <div class="video-puntos-badge" style="margin-bottom:6px;">Programa CMN: <strong>Puntos ${{v.puntos}}</strong></div>
          <div class="video-actions">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="app.verVideo('${{v.id}}')">Ver en plataforma</button>
            <a class="btn btn-sm" href="${{v.link}}" target="_blank" rel="noopener" style="padding:8px 10px;" title="Abrir directamente en YouTube">YouTube ↗</a>
            ${{v.backupLink ? `<a class="btn btn-sm" href="${{v.backupLink}}" target="_blank" rel="noopener" style="padding:8px 8px;" title="Ver clase alternativa recomendada en YouTube">Alt ↗</a>` : ''}}
            ${{v.docOficial ? `<a class="btn btn-sm" href="${{v.docOficial.url}}" target="_blank" rel="noopener" style="padding:8px 8px;" title="Abrir documentación técnica oficial">Docs ↗</a>` : ''}}
            <button class="btn btn-sm" onclick="app.copiarLinkVideo('${{v.link}}')" title="Copiar enlace de YouTube">Copiar</button>
          </div>
        </div>
      </div>
    `;
  }}).join('');
}};

app.filtrarVideos = function(pilar) {{
  app.videoFiltro = pilar;
  app.renderVideoteca();
}};

app.buscarVideos = function(term) {{
  app.videoBusqueda = term;
  app.renderVideoteca();
}};

app.verVideo = function(videoId) {{
  const v = VIDEOS.find(item => item.id === videoId);
  if (!v) return;
  app.currentVideo = v;

  document.getElementById('videoTitle').textContent = v.titulo;
  document.getElementById('videoSub').textContent = `${{v.canal}} • Duración: ${{v.duracion}} • ${{v.pilarName}} • Puntos CMN: ${{v.puntos}}`;
  
  const btnYt = document.getElementById('videoOpenYt');
  if (btnYt) btnYt.href = v.link;

  const directNotice = document.getElementById('videoDirectLinkNotice');
  if (directNotice) directNotice.href = v.link;

  const btnBackup = document.getElementById('videoOpenBackup');
  if (btnBackup) {{
    if (v.backupLink) {{
      btnBackup.href = v.backupLink;
      btnBackup.style.display = 'inline-flex';
      btnBackup.title = `Alternativo: ${{v.backupTitulo}} (${{v.backupCanal}})`;
    }} else {{
      btnBackup.style.display = 'none';
    }}
  }}

  const btnDoc = document.getElementById('videoOpenDoc');
  if (btnDoc) {{
    if (v.docOficial && v.docOficial.url) {{
      btnDoc.href = v.docOficial.url;
      btnDoc.style.display = 'inline-flex';
      btnDoc.title = `Docs: ${{v.docOficial.titulo}}`;
    }} else {{
      btnDoc.style.display = 'none';
    }}
  }}

  const base = (app.embedProvider === 'nocookie') ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/';
  const embedUrl = `${{base}}${{v.ytId}}?autoplay=1&rel=0&enablejsapi=1`;
  document.getElementById('videoIframe').src = embedUrl;

  let detailsHtml = `
    <div style="font-weight:600; color:var(--text); margin-bottom:4px;">Síntesis explicativa de la clase:</div>
    <div style="margin-bottom:10px; line-height:1.5;">${{v.descripcion}}</div>
    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px;">
      <strong style="color:var(--text); font-size:11px; margin-right:4px;">Conceptos clave evaluados:</strong>
      ${{v.temasClave.map(t => `<span class="tag">${{t}}</span>`).join(' ')}}
    </div>
    
    <div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius); padding:10px 12px; margin-top:8px;">
      <div style="font-weight:700; font-size:11.5px; color:var(--text); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        <span>🌐 Recursos y Documentación Externa Oficial:</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px;">
        ${{v.docOficial ? `
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:6px 8px;">
            <div style="font-size:10px; color:var(--accent); font-weight:700;">DOCUMENTACIÓN TÉCNICA OFICIAL</div>
            <a href="${{v.docOficial.url}}" target="_blank" rel="noopener" style="font-size:12px; font-weight:600; color:var(--text); text-decoration:none; display:inline-block; margin:2px 0;">
              ${{v.docOficial.titulo}} ↗
            </a>
            <div style="font-size:11px; color:var(--text-muted);">${{v.docOficial.desc}}</div>
          </div>
        ` : ''}}
        ${{v.herramientaWeb ? `
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:6px 8px;">
            <div style="font-size:10px; color:var(--success); font-weight:700;">HERRAMIENTA / SIMULADOR WEB</div>
            <a href="${{v.herramientaWeb.url}}" target="_blank" rel="noopener" style="font-size:12px; font-weight:600; color:var(--text); text-decoration:none; display:inline-block; margin:2px 0;">
              ${{v.herramientaWeb.titulo}} ↗
            </a>
            <div style="font-size:11px; color:var(--text-muted);">${{v.herramientaWeb.desc}}</div>
          </div>
        ` : ''}}
        ${{v.backupLink ? `
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:6px 8px;">
            <div style="font-size:10px; color:#f59e0b; font-weight:700;">VIDEO ALTERNATIVO DE RESPALDO (YOUTUBE)</div>
            <a href="${{v.backupLink}}" target="_blank" rel="noopener" style="font-size:12px; font-weight:600; color:var(--text); text-decoration:none; display:inline-block; margin:2px 0;">
              ${{v.backupTitulo}} ↗
            </a>
            <div style="font-size:11px; color:var(--text-muted);">Canal: ${{v.backupCanal}}</div>
          </div>
        ` : ''}}
      </div>
    </div>
  `;

  document.getElementById('videoDetails').innerHTML = detailsHtml;
  document.getElementById('videoOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}};

app.cerrarVideo = function() {{
  const overlay = document.getElementById('videoOverlay');
  if (overlay) overlay.classList.remove('open');
  const ifr = document.getElementById('videoIframe');
  if (ifr) ifr.src = '';
  document.body.style.overflow = '';
}};

app.copiarLinkVideo = function(link) {{
  if (navigator.clipboard && navigator.clipboard.writeText) {{
    navigator.clipboard.writeText(link).then(() => {{
      app.toast('Enlace de YouTube copiado al portapapeles');
    }}).catch(() => {{
      prompt('Copia el siguiente enlace:', link);
    }});
  }} else {{
    prompt('Copia el siguiente enlace:', link);
  }}
}};

app.verClasesPilar = function(pilar) {{
  app.switchTab('videoteca');
  app.filtrarVideos(pilar);
  const searchInp = document.getElementById('videoSearchInput');
  if (searchInp) searchInp.value = '';
  app.videoBusqueda = '';
}};
"""

# Read current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace from VIDEOTECA MAGISTRAL DATA until BIBLIOGRAFÍA VERIFICADA
old_block_pattern = r'/\* ==================== VIDEOTECA MAGISTRAL DATA ==================== \*/[\s\S]*?(?=/\* ==================== BIBLIOGRAFÍA VERIFICADA ==================== \*/)'
if re.search(old_block_pattern, html):
    html = re.sub(old_block_pattern, new_videoteca_js + '\n', html, count=1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("VIDEOS and methods replaced successfully in index.html!")
else:
    print("Could not find old_block_pattern!")
