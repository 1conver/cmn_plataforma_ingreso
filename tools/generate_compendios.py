# -*- coding: utf-8 -*-
"""
Generador de compendios de estudio CMN - Escalafon Sistema Computacion de Datos.
Los 4 PDFs son SINTESIS PROPIAS de estudio (no reproduccion de los libros originales),
alineadas al Programa Intelectual de Ingreso del CMN (El Palomar, nov. 2015).
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether, HRFlowable)

OUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Paleta sobria coherente con la plataforma (grafito / carbono)
INK      = colors.HexColor('#1a1c22')
GRAPHITE = colors.HexColor('#14161a')
MUTED    = colors.HexColor('#5a6070')
LINE     = colors.HexColor('#c9ccd4')
SOFT     = colors.HexColor('#eef0f4')
ACCENT   = colors.HexColor('#39415a')
WARNBG   = colors.HexColor('#f4efe3')
WARNLN   = colors.HexColor('#b7a15c')

S = {
    'title':  ParagraphStyle('title',  fontName='Helvetica-Bold', fontSize=17, leading=21, textColor=GRAPHITE, spaceAfter=2),
    'sub':    ParagraphStyle('sub',    fontName='Helvetica', fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=6),
    'h2':     ParagraphStyle('h2',     fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=GRAPHITE, spaceBefore=12, spaceAfter=4),
    'h3':     ParagraphStyle('h3',     fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=ACCENT, spaceBefore=7, spaceAfter=2),
    'body':   ParagraphStyle('body',   fontName='Helvetica', fontSize=9, leading=12.6, textColor=INK, alignment=TA_LEFT, spaceAfter=3),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9, leading=12.2, textColor=INK, leftIndent=10, bulletIndent=2, spaceAfter=2),
    'note':   ParagraphStyle('note',   fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=MUTED, spaceBefore=4),
    'warn':   ParagraphStyle('warn',   fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#5c4d1e')),
    'th':     ParagraphStyle('th',     fontName='Helvetica-Bold', fontSize=8.2, leading=10.5, textColor=colors.white),
    'td':     ParagraphStyle('td',     fontName='Helvetica', fontSize=8.2, leading=10.5, textColor=INK),
    'tdb':    ParagraphStyle('tdb',    fontName='Helvetica-Bold', fontSize=8.2, leading=10.5, textColor=INK),
    'code':   ParagraphStyle('code',   fontName='Courier', fontSize=7.8, leading=10.6, textColor=INK, backColor=SOFT, borderPadding=4, leftIndent=4, spaceAfter=4, spaceBefore=2),
}

def headfoot(canvas, doc):
    canvas.saveState()
    w, h = A4
    # banda superior
    canvas.setFillColor(GRAPHITE)
    canvas.rect(0, h - 16*mm, w, 16*mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont('Helvetica-Bold', 8)
    canvas.drawString(18*mm, h - 7.5*mm, 'COLEGIO MILITAR DE LA NACION  ·  ESCALAFON SISTEMA COMPUTACION DE DATOS')
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(colors.HexColor('#9aa2b5'))
    canvas.drawString(18*mm, h - 12*mm, 'Sintesis de estudio para el Programa Intelectual de Ingreso')
    canvas.setFillColor(colors.HexColor('#9aa2b5'))
    canvas.drawRightString(w - 18*mm, h - 7.5*mm, 'USO INTERNO DE ESTUDIO')
    # pie
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(18*mm, 14*mm, w - 18*mm, 14*mm)
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawString(18*mm, 9.5*mm, doc.compendio_label)
    canvas.drawRightString(w - 18*mm, 9.5*mm, 'Pagina %d' % doc.page)
    canvas.restoreState()

def build(filename, label, title, subtitle, disclaimer, flows):
    doc = BaseDocTemplate(os.path.join(OUT_DIR, filename), pagesize=A4,
                          leftMargin=18*mm, rightMargin=18*mm, topMargin=24*mm, bottomMargin=20*mm)
    doc.compendio_label = label
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')
    doc.addPageTemplates([PageTemplate(id='page', frames=[frame], onPage=headfoot)])
    story = []
    story.append(Paragraph(title, S['title']))
    story.append(Paragraph(subtitle, S['sub']))
    story.append(HRFlowable(width='100%', thickness=0.8, color=GRAPHITE, spaceBefore=2, spaceAfter=6))
    warn = Table([[Paragraph(disclaimer, S['warn'])]], colWidths=[doc.width])
    warn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), WARNBG),
        ('BOX', (0,0), (-1,-1), 0.7, WARNLN),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(warn)
    story.append(Spacer(1, 4))
    story.extend(flows)
    doc.build(story)

def H2(t): return Paragraph(t, S['h2'])
def H3(t): return Paragraph(t, S['h3'])
def P(t):  return Paragraph(t, S['body'])
def B(t):  return Paragraph(t, S['bullet'], bulletText='•')
def NOTE(t): return Paragraph(t, S['note'])
def CODE(t): return Paragraph(t.replace('\n', '<br/>'), S['code'])

def TBL(headers, rows, widths=None):
    data = [[Paragraph(h, S['th']) for h in headers]]
    for r in rows:
        cells = []
        for i, c in enumerate(r):
            st = S['tdb'] if i == 0 else S['td']
            cells.append(Paragraph(c, st))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), GRAPHITE),
        ('GRID', (0,0), (-1,-1), 0.4, LINE),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SOFT]),
        ('LEFTPADDING', (0,0), (-1,-1), 5), ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    return t

DISCLAIMER = ('<b>Alcance de este documento:</b> sintesis de estudio propia elaborada para la preparacion del '
              'concurso. <b>NO reproduce ni reemplaza las obras originales</b> de la bibliografia oficial del '
              'Programa Intelectual de Ingreso del CMN (obras protegidas por derecho de autor de sus respectivos '
              'editores). Para el texto completo consulte los originales indicados en la bibliografia.')

BIB_A = ('Bibliografia oficial de referencia (Programa CMN): U. Black, <i>Redes de Computadores. Protocolos, '
         'normas e interfaces</i> (Ra-Ma) &middot; A. R. Castro Lechtaler y R. J. Fusario, <i>Teleinformatica '
         'para ingenieros en Sistemas de Informacion</i>, Vol. 2 (Reverte) &middot; E. Rozell, <i>TestPrep MCSE '
         'TCP/IP</i> (New Riders) &middot; J. Adamson, <i>TestPrep MCSE Networking Essentials</i> (New Riders) '
         '&middot; J. A. Carballar, <i>Internet. Libro del Navegante</i> (Ra-Ma) &middot; Cisco Networking '
         'Academy, <i>CCNA 1 y 2</i>.')

# ============================================================ COMPENDIO A
def compendio_a():
    f = []
    f.append(H2('1. Modelos de referencia: ISO-OSI y TCP/IP'))
    f.append(P('El modelo <b>ISO-OSI</b> descompone la comunicacion en 7 capas; cada capa entrega a la inferior '
               'y encapsula la informacion de la superior en una unidad de datos de protocolo (PDU) propia.'))
    f.append(TBL(['Capa', 'PDU', 'Direccionamiento', 'Dispositivos tipicos', 'Funcion clave'], [
        ['7 Aplicacion', 'Datos', '-', 'Gateway, proxy', 'Interfaz con aplicaciones (HTTP, SMTP, DNS)'],
        ['6 Presentacion', 'Datos', '-', '-', 'Formato, codificacion, cifrado (ASCII, JPEG, TLS)'],
        ['5 Sesion', 'Datos', '-', '-', 'Dialogo, sincronizacion y puntos de control'],
        ['4 Transporte', 'Segmento', 'Puertos (16 bits)', 'Firewall de estado', 'TCP confiable / UDP rapido, multiplexion'],
        ['3 Red', 'Paquete', 'IP logica (32 bits)', 'Router', 'Direccionamiento y enrutamiento entre redes'],
        ['2 Enlace', 'Trama', 'MAC fisica (48 bits)', 'Switch, Bridge', 'Acceso al medio, deteccion de errores (FCS)'],
        ['1 Fisica', 'Bit', '-', 'Hub, Repetidor', 'Senales electricas/opticas sobre el medio'],
    ], [24*mm, 17*mm, 30*mm, 32*mm, None]))
    f.append(P('La suite <b>TCP/IP</b> concentra esas 7 capas en 4: Acceso a Red (OSI 1-2), Internet (OSI 3), '
               'Transporte (OSI 4) y Aplicacion (OSI 5-7). Es el modelo operativo real de Internet.'))
    f.append(H3('Capa 4: TCP frente a UDP'))
    f.append(B('<b>TCP:</b> orientado a conexion. Establecimiento por <b>Three-Way Handshake</b> (SYN, SYN-ACK, ACK) '
               'que sincroniza los numeros de secuencia iniciales (ISN). Fiabilidad por ACK y retransmision, '
               'control de flujo por ventana deslizante, control de congestion.'))
    f.append(B('<b>UDP:</b> sin conexion, sin confirmacion ni orden; minimo overhead. Ideal para voz, streaming y DNS.'))

    f.append(H2('2. Dispositivos de interconexion'))
    f.append(TBL(['Dispositivo', 'Capa OSI', 'Dominio de colision', 'Dominio de broadcast', 'Criterio de reenvio'], [
        ['Repetidor', '1', 'Unico (compartido)', 'Unico', 'Regenera la senal electrica bit a bit'],
        ['Hub (concentrador)', '1', 'Unico (todos los puertos)', 'Unico', 'Repite la trama a todos los puertos'],
        ['Bridge (puente)', '2', 'Uno por segmento', 'Unico', 'Tabla MAC por software; conecta segmentos'],
        ['Switch Ethernet', '2', 'Uno por puerto', 'Unico (sin VLAN)', 'Tabla CAM por hardware (ASIC); store-and-forward'],
        ['Router', '3', 'Uno por interfaz', 'Uno por interfaz', 'Tabla de ruteo; decisiones por direccion IP'],
    ], [30*mm, 16*mm, 34*mm, 34*mm, None]))
    f.append(B('<b>Switch en modo store-and-forward:</b> recibe la trama completa, valida el <b>FCS</b> (CRC-32 del '
               'trailer) y la descarta en silencio si viene corrupta: Ethernet es no confiable; la recuperacion '
               'es tarea de TCP en Capa 4.'))
    f.append(B('<b>Tablas CAM/MAC:</b> el switch aprende las MAC de origen al recibir tramas y envejece las entradas; '
               'con destino desconocido realiza flooding dentro del dominio de broadcast.'))
    f.append(B('<b>Router:</b> unico delimitador estricto de dominios de difusion; cada interfaz es una red distinta.'))

    f.append(H2('3. Cableado de red'))
    f.append(TBL(['Medio', 'Norma / estandar', 'Distancia maxima', 'Notas de examen'], [
        ['Par trenzado UTP', '10BASE-T, 100BASE-TX, 1000BASE-T (IEEE 802.3)', '100 m', 'Conector RJ-45; normas T568A/T568B '
         '(directo para PC-Switch; cruzado para equipos iguales); diafonia (crosstalk) como principal ruido'],
        ['Coaxial', '10BASE2 (delgado, 185 m) / 10BASE5 (grueso, 500 m)', '185 m / 500 m', 'Topologia bus con terminadores; '
         'obsoleto pero exigido por el programa'],
        ['Fibra optica', '100BASE-FX, 1000BASE-SX/LX', '2 km (MM) / decenas de km (SM)', 'Monomodo: nucleo fino, laser, '
         'largas distancias (WAN). Multimodo: LED, campus/LAN. Inmune a EMI'],
        ['Inalambrico', 'IEEE 802.11 a/b/g/n/ac', 'Variable', 'a: 5 GHz, b: 11 Mbps, g: 54 Mbps, n/ac: MIMO y '
         'agregacion de canales'],
    ], [28*mm, 52*mm, 28*mm, None]))
    f.append(NOTE('En UTP solo se usan 2 pares en Fast Ethernet (pines 1-2 TX y 3-6 RX); Gigabit usa los 4 pares.'))

    f.append(H2('4. Direccionamiento IPv4 y subneteo'))
    f.append(TBL(['Clase', 'Primer octeto', 'Mascara por defecto', 'Rango de redes'], [
        ['A', '1 - 126', '255.0.0.0 (/8)', 'Redes muy grandes (16,7 M hosts)'],
        ['B', '128 - 191', '255.255.0.0 (/16)', 'Redes medianas (65.534 hosts)'],
        ['C', '192 - 223', '255.255.255.0 (/24)', 'Redes pequenas (254 hosts)'],
    ], [16*mm, 30*mm, 45*mm, None]))
    f.append(B('<b>Rangos privados RFC 1918:</b> 10.0.0.0/8 &middot; 172.16.0.0/12 &middot; 192.168.0.0/16. '
               'No enrutables en Internet; requieren NAT.'))
    f.append(B('<b>Direcciones especiales:</b> 127.x.x.x (loopback), primer host de red = direccion de red, '
               'ultimo = broadcast. Hosts utiles = 2<super>n</super> - 2.'))
    f.append(H3('Metodo del octeto critico (CCNA)'))
    f.append(P('El <b>octeto critico</b> es aquel donde el prefijo CIDR no cae en un limite de 8 bits. '
               'Salto de bloque = 256 - valor de la mascara en ese octeto. Ejemplo 172.16.89.45 /22:'))
    f.append(CODE('/22 = 255.255.252.0  ->  octeto critico = 3ro (valor 252)\n'
                  'Salto de bloque = 256 - 252 = 4  ->  bloques: 0, 4, 8 ... 88, 92\n'
                  '89 cae en el bloque 88:   Red = 172.16.88.0\n'
                  'Broadcast = siguiente red - 1 = 172.16.91.255\n'
                  'Primer host = 172.16.88.1   Ultimo host = 172.16.91.254\n'
                  'Hosts utiles = 2^10 - 2 = 1022'))

    f.append(H2('5. Enrutamiento'))
    f.append(TBL(['Origen de la ruta', 'Distancia administrativa'], [
        ['Interfaz directamente conectada', '0'],
        ['Ruta estatica', '1'],
        ['EIGRP (interno)', '90'],
        ['OSPF', '110'],
        ['RIP', '120'],
    ], [80*mm, 40*mm]))
    f.append(B('<b>RIP (Routing Information Protocol):</b> vector-distancia; metrica en saltos (maximo 15, 16 = '
               'inalcanzable); actualiza cada 30 s; bucles se mitigan con Split Horizon, Poison Reverse y '
               'route poisoning.'))
    f.append(B('<b>OSPF (Open Shortest Path First):</b> estado de enlace; cada router construye el mapa completo '
               'con el algoritmo de <b>Dijkstra (SPF)</b>; metrica por costo (ancho de banda); soporta areas '
               'jerarquicas con Area 0 (backbone) y convergencia rapida.'))
    f.append(B('<b>Estaticas vs dinamicas:</b> la ruta estatica la configura el administrador (control total, sin '
               'adaptacion); la dinamica se aprende y se adapta sola ante fallos.'))

    f.append(H2('6. Redes WAN: Frame Relay, PPP y HDLC'))
    f.append(H3('Frame Relay'))
    f.append(B('Conmutacion de paquetes sobre circuitos virtuales permanentes (PVC) en topologia <b>NBMA</b> '
               '(multiples accesos sin broadcast).'))
    f.append(B('<b>DLCI</b> (Data Link Connection Identifier): identifica <b>localmente</b> cada PVC (solo tiene '
               'significado en el tramo local).'))
    f.append(B('<b>LMI</b> (Local Management Interface): senalizacion de estado y keepalive entre DTE y DCE.'))
    f.append(B('<b>CIR</b>: velocidad comprometida del operador. <b>FECN/BECN</b>: notificacion explicita de '
               'congestion hacia receptor y remitente.'))
    f.append(H3('PPP (Point-to-Point Protocol)'))
    f.append(B('Estandar abierto para enlaces seriales punto a punto. Dos componentes: <b>LCP</b> (Link Control '
               'Protocol: establece, configura y prueba el enlace; negocia autenticacion y compresion) y '
               '<b>NCP</b> (Network Control Protocol: encapsula y negocia cada protocolo de Capa 3, ej. IPCP).'))
    f.append(B('Autenticacion: <b>PAP</b> (usuario y clave en texto plano, 2 vias) frente a <b>CHAP</b> '
               '(desafio de 3 vias con hash MD5: la clave nunca viaja).'))
    f.append(H3('HDLC'))
    f.append(B('Protocolo de enlace serial orientado a bits, heredado de IBM SDLC. La version de <b>Cisco es '
               'propietaria</b> (campo de tipo propio), por lo que solo interopera HDLC-HDLC entre equipos Cisco. '
               'Sin autenticacion nativa: para eso se prefiere PPP.'))
    f.append(NOTE(BIB_A))
    build('Bibliografia_PilarA_Redes_CCNA.pdf',
          'Compendio A de estudio - Redes y Teleinformatica',
          'COMPENDIO A · REDES Y TELEINFORMATICA',
          'Topologias, dispositivos, cableado, direccionamiento, subneteo, enrutamiento y protocolos WAN',
          DISCLAIMER, f)

# ============================================================ COMPENDIO B
def compendio_b():
    f = []
    f.append(H2('1. Instalacion y arquitectura de Active Directory'))
    f.append(P('Un <b>Controlador de Dominio (DC)</b> es un servidor con el rol <b>AD DS</b> que hospeda una copia '
               'de la base de datos del directorio (<b>NTDS.dit</b>) y el servicio <b>Kerberos v5</b> para la '
               'autenticacion. Toda instalacion requiere particion NTFS, TCP/IP configurado con el propio como '
               'DNS preferido, y definicion de nombre de dominio DNS y nivel funcional.'))
    f.append(H3('Estructura logica'))
    f.append(B('<b>Unidad Organizativa (OU):</b> contenedor para delegar administracion y aplicar GPO con '
               'granularidad (se alinean con la estructura de la organizacion: ej. OU Arsenales).'))
    f.append(B('<b>Dominio:</b> unidad de seguridad y replicacion; limite de politicas y de cuentas.'))
    f.append(B('<b>Arbol:</b> dominio raiz e hijos con <b>espacio de nombres DNS contiguo</b> (ej. ejercito.mil.ar '
               'y cmn.ejercito.mil.ar). Confianza transitiva Kerberos automatica entre dominios del arbol.'))
    f.append(B('<b>Bosque:</b> conjunto de arboles con espacios DNS disjuntos; es la <b>frontera de seguridad</b>. '
               'Comparte un unico <b>Esquema</b>, un <b>Catalogo Global</b> y la particion de Configuracion.'))
    f.append(H3('Estructura fisica'))
    f.append(B('<b>Sitios (Sites):</b> grupos de subredes IP de alta velocidad. Definen la <b>replicacion</b>: '
               'intra-sitio (RPC notificado, sin comprimir, ~5 min) frente a inter-sitio (programada y comprimida, '
               'ahora de ancho de banda; puede usar SMTP). Cada sitio debe tener al menos un <b>bridgehead</b>.'))
    f.append(P('<b>Protocolos de replicacion:</b> RPC sobre IP (predeterminado, autenticado y cifrado) y SMTP '
               '(solo para particiones de Configuracion y Esquema entre sitios; no replica el dominio).'))

    f.append(H2('2. Roles FSMO (Flexible Single Master Operations)'))
    f.append(TBL(['Rol', 'Alcance', 'Funcion', 'Impacto si falla'], [
        ['Schema Master', 'Bosque (1)', 'Unica fuente de modificaciones del esquema (clases y atributos)', 'No se extiende el esquema (ej. instalar Exchange)'],
        ['Domain Naming Master', 'Bosque (1)', 'Alta y baja de dominios del bosque', 'No se agregan/eliminan dominios'],
        ['RID Master', 'Dominio (1 c/u)', 'Asigna pools de identificadores relativos (RID) para crear SIDs unicos', 'Al agotarse el pool local no se crean objetos'],
        ['PDC Emulator', 'Dominio (1 c/u)', 'Maestro de hora (SNTP), cambios prioritarios de clave, compatibilidad NT', 'Problemas de hora y de bloqueos de cuenta'],
        ['Infrastructure Master', 'Dominio (1 c/u)', 'Actualiza referencias de objetos entre dominios (SID/GDN)', 'Grupos con miembros externos desactualizados'],
    ], [34*mm, 26*mm, None, 42*mm]))
    f.append(B('Recomendacion clasica: el <b>Infrastructure Master no debe hospedarse</b> en un DC que tambien sea '
               'Catalogo Global cuando exista mas de un dominio (no tiene nada que corregir).'))
    f.append(B('Gestion con <b>NTDSUTIL</b> (transferencia y apoderamiento/seizure) o consolas MMC.'))

    f.append(H2('3. Cuentas, grupos y estrategia AGDLP'))
    f.append(B('<b>Cuentas de usuario:</b> locales (solo en el equipo), de dominio y built-in (Administrator, '
               'Guest). <b>Cuentas de equipo:</b> agregan la estacion al dominio (formato NOMBRE$).'))
    f.append(TBL(['Grupo', 'Alcance de miembros', 'Puede ser miembro de', 'Uso tipico'], [
        ['Global (GG)', 'Usuarios/equipos del propio dominio', 'Grupos globales y locales de dominio (mismo u otro dominio con confianza)', 'Agrupar usuarios por rol (GG-Operadores)'],
        ['Local de Dominio (DLG)', 'Usuarios/grupos de cualquier dominio confiable', 'Solo grupos locales del propio dominio; se le asignan permisos', 'Agrupar permisos sobre un recurso (DLG-Imprimir-Arsenal)'],
        ['Universal (UG)', 'Cualquier dominio del bosque', 'Cualquier grupo del bosque', 'Solo se usan con Catalogo Global; cambios generan replicacion completa'],
    ], [32*mm, 44*mm, 48*mm, None]))
    f.append(P('<b>Estrategia AGDLP:</b> <b>A</b>ccounts (cuentas) se agregan a <b>G</b>lobal Groups por rol '
               'profesional; estos a <b>D</b>omain <b>L</b>ocal groups creados por recurso; al DLG se le asignan '
               'los <b>P</b>ermisos NTFS. Permite administrar permisos de manera escalable sin tocar el recurso '
               'cada vez que cambia el personal.'))
    f.append(CODE('Caso Arsenales:\n'
                  'A : frmartinez, lgomez            (cuentas)\n'
                  'G : GG_Operadores_Arsenal         (rol)\n'
                  'DL: DLG_Mod_Deposito_Central      (recurso)\n'
                  'P : DLG_Mod_Deposito_Central -> Modificar sobre \\\\SRV01\\Arsenales$'))

    f.append(H2('4. Permisos: NTFS, recursos compartidos e impresoras'))
    f.append(H3('NTFS frente a Share'))
    f.append(TBL(['Criterio', 'Permisos Compartir (Share)', 'Permisos NTFS'], [
        ['Alcance', 'Solo acceso por red (UNC \\\\servidor\\recurso)', 'Local y por red'],
        ['Granularidad', 'Solo lectura / cambio / control total', 'Detallados: leer, escribir, ejecutar, modificar, tomar posesion...'],
        ['Herencia', 'No hereda a subcarpetas de forma configurable', 'Heredable desde la carpeta padre'],
        ['Copiar / mover', 'Perdidos al copiar o mover a otro volumen', 'Copiar: pierde ACL. Mover mismo volumen: conserva'],
    ], [26*mm, 62*mm, None]))
    f.append(B('<b>Acceso por red</b> = combinacion (interseccion) de Share y NTFS: <b>prevalece el permiso mas '
               'restrictivo</b>. Un <b>Denegar (Deny) explicito siempre invalida</b> cualquier Permitir.'))
    f.append(B('Permisos NTFS acumulan la suma de todos los permisos concedidos por grupos a los que pertenece el '
               'usuario (salvo Deny). <b>Tomar posesion</b> permite a un administrador recuperar recursos.'))
    f.append(H3('Auditoria NTFS'))
    f.append(B('1) GPO: Configuracion del equipo / Configuracion de Windows / Directivas de seguridad / '
               'Directivas locales / Directiva de auditoria &rarr; habilitar <b>"Auditar acceso a objetos"</b> '
               '(exito y/o fracaso). 2) En la carpeta: Seguridad &rarr; Opciones avanzadas &rarr; <b>Auditoria</b> '
               '&rarr; agregar usuarios y eventos a auditar. 3) Los eventos quedan en el <b>Registro de Seguridad</b> '
               '(Visor de eventos, evento 560/4663).'))
    f.append(H3('Configuracion de impresoras'))
    f.append(B('<b>Compartir impresora:</b> propiedades &rarr; compartir con nombre (\\\\servidor\\impresora); '
               'drivers para cada arquitectura de cliente (x86/x64).'))
    f.append(B('<b>Permisos de impresora:</b> Imprimir (todos por defecto), Administrar documentos y '
               'Administrar impresoras; se combinan con NTFS de la carpeta spool bajo la misma regla restrictiva.'))
    f.append(B('<b>Pool de impresoras:</b> varias colas fisicas atendidas por un solo puerto logico. '
               '<b>Prioridades:</b> varias impresoras logicas sobre la misma fisica con distinta prioridad y '
               'horarios (ej. ordenes del dia con prioridad alta).'))

    f.append(H2('5. Servicios de red en Windows Server'))
    f.append(TBL(['Servicio', 'Conceptos de examen'], [
        ['DNS', 'Zonas integradas en AD (replicacion segura, actualizacion dinamica segura). Registros: A (nombre->IP), PTR (IP->nombre, zona inversa), SRV (localizacion de servicios: _ldap._tcp, _kerberos), CNAME (alias), MX, NS'],
        ['WINS', 'Resolucion de nombres <b>NetBIOS</b> a IP para clientes legados (SMBv1); tipos de nodo NetBIOS: b-node (broadcast), p-node (punto a punto), m-node (mixto), h-node (hibrido, predeterminado)'],
        ['DHCP', 'Concesion <b>DORA</b>: Discover, Offer, Request, Acknowledge; ambitos, exclusiones, reservas por MAC, opciones (003 router, 006 DNS, 015 dominio); integracion con DNS dinamico (registro A y PTR)'],
        ['RRAS', 'Routing and Remote Access: enrutamiento LAN-LAN, NAT y acceso remoto (acceso telefonico y VPN)'],
        ['VPN', '<b>PPTP</b>: puerto TCP 1723 + GRE, tunel sin cifrado propio (usa MPPE debil de 40/128 bits, clave derivada de la contrasena). <b>L2TP/IPSec</b>: UDP 1701 dentro de IPSec, cifrado ESP con AES y HMAC de integridad; requiere certificado o clave precompartida'],
        ['RADIUS / NPS', 'Network Policy Server: autenticacion, autorizacion y registro (AAA) centralizados; backend de VPN y <b>802.1X</b> para autenticacion de acceso a la red por puerto'],
        ['DFS', 'Distributed File System: <b>Namespaces</b> (arbol logico unificado de multiples servidores, con referencia y failover) y <b>Replication</b> (DFS-R, replicacion multimaestro por bloques RDC comprimidos)'],
    ], [24*mm, None]))
    f.append(NOTE('Bibliografia oficial de referencia (Programa CMN): Microsoft Official Curriculum, '
                  '<i>Implementing Microsoft Windows 2008 Professional and Server</i> &middot; <i>Microsoft TechNet</i> '
                  '&middot; J. Adamson, <i>TestPrep MCSE Networking Essentials</i> (New Riders).'))
    build('Bibliografia_PilarB_WindowsServer_AD.pdf',
          'Compendio B de estudio - Windows Server y Active Directory',
          'COMPENDIO B · SISTEMAS OPERATIVOS: WINDOWS SERVER Y ACTIVE DIRECTORY',
          'Instalacion, arbol y bosque, sitios, FSMO, cuentas y grupos, permisos, impresoras y servicios',
          DISCLAIMER, f)

# ============================================================ COMPENDIO C
def compendio_c():
    f = []
    f.append(H2('1. Desarrollo del software y UML'))
    f.append(TBL(['Ciclo de vida', 'Idea central'], [
        ['Cascada', 'Fases lineales (requisitos, analisis, diseno, codificacion, pruebas, explotacion); rigido, documentacion intensa'],
        ['Iterativo / Incremental', 'Versiones sucesivas que agregan funcionalidad; feedback temprano'],
        ['Espiral (Boehm)', 'Ciclos de 4 cuadrantes con evaluacion de riesgos en cada vuelta'],
    ], [40*mm, None]))
    f.append(B('<b>UML</b> (Unified Modeling Language): lenguaje de modelado estandar (OMG), <b>no</b> un metodo '
               'ni un lenguaje de programacion.'))
    f.append(B('<b>Diagramas estructurales</b> (estaticos): clases (atributos, operaciones, relaciones de '
               'asociacion, agregacion, composicion, herencia), componentes, objetos, despliegue, paquetes.'))
    f.append(B('<b>Diagramas de comportamiento</b> (dinamicos): casos de uso (actores y escenarios), secuencia '
               '(interaccion ordenada en el tiempo), actividades (flujos con decisiones y paralelismo), estados '
               '(transiciones por eventos).'))

    f.append(H2('2. Traductores, compiladores y compaginadores'))
    f.append(TBL(['Herramienta', 'Funcion'], [
        ['Compilador', 'Traduce <b>todo</b> el codigo fuente a codigo objeto <b>antes</b> de ejecutar; deteccion de errores en fase de compilacion; binario autonomo (C, Pascal)'],
        ['Interprete', 'Traduce y ejecuta <b>instruccion por instruccion</b> en tiempo real; sin binario; mas lento y flexible (BASIC clasico, VBScript, PHP clasico)'],
        ['Ensamblador', 'Traduce mnemonicos de assembler a lenguaje maquina 1 a 1'],
        ['Compaginador / Enlazador (Linker)', 'Resuelve referencias cruzadas entre modulos compilados y bibliotecas (estaticas: se incrustan; dinamicas DLL: se resuelven en carga) y ensambla el ejecutable'],
    ], [48*mm, None]))
    f.append(P('Fases del compilador: <b>analisis lexico</b> (tokens) &rarr; <b>sintactico</b> (arbol AST) &rarr; '
               '<b>semantico</b> (tipos, ambitos) &rarr; <b>optimizacion</b> &rarr; <b>generacion de codigo '
               'objeto</b>. Tabla de simbolos y manejo de errores atraviesan todo el proceso.'))

    f.append(H2('3. Historia de los lenguajes de procesamiento'))
    f.append(TBL(['Aprox.', 'Lenguaje', 'Aporte'], [
        ['1940s', 'Lenguaje maquina / ensamblador', 'Programacion directa en binario y mnemonicos'],
        ['1957', 'FORTRAN (Backus, IBM)', 'Primer lenguaje de alto nivel compilado; computo cientifico'],
        ['1958', 'LISP', 'Primer lenguaje funcional; listas y recursion'],
        ['1959', 'COBOL', 'Procesamiento de datos comerciales; registros y archivos'],
        ['1960', 'ALGOL 60', 'Base sintactica de casi todos los lenguajes; bloques y ambito'],
        ['1964', 'BASIC', 'Ensenanza e interpretes interactivos'],
        ['1970', 'Pascal (Wirth)', 'Programacion estructurada didactica'],
        ['1972', 'C (Ritchie, Bell Labs)', 'Sistema operativo UNIX; acceso a memoria con punteros'],
        ['1974', 'SQL (Chamberlin, IBM)', 'Lenguaje declarativo de bases de datos'],
        ['1983', 'C++ (Stroustrup)', 'POO sobre C; clases, herencia, plantillas'],
        ['1991', 'Python', 'Legibilidad, multi-paradigma, scripts'],
        ['1995', 'Java / JavaScript / PHP', 'Maquina virtual JVM; Netscape (Eich); web server-side (Lerdorf)'],
        ['2000', 'C# (.NET)', 'Plataforma gestionada de Microsoft'],
    ], [18*mm, 52*mm, None]))

    f.append(H2('4. Programacion estructurada'))
    f.append(B('Corriente formalizada por <b>Dijkstra</b> ("Go To Statement Considered Harmful", 1968), con base '
               'en el <b>teorema de Bohm-Jacopini</b>: todo algoritmo puede expresarse con solo <b>3 estructuras '
               'de control</b>: secuencia, seleccion (decision) e iteracion.'))
    f.append(B('El objetivo es claridad y verificabilidad: sin saltos arbitrarios (GOTO), diseno <b>descendente '
               '(top-down)</b>, refinamiento sucesivo y modulos con <b>alta cohesion</b> y <b>bajo acoplamiento</b>.'))

    f.append(H2('5. Paradigmas de programacion (6 del Programa CMN)'))
    f.append(TBL(['Paradigma', 'Concepto', 'Ejemplos de lenguajes'], [
        ['Imperativo', 'Programa como secuencia de ordenes que mutan el estado; control de flujo explicito', 'C, Pascal, COBOL'],
        ['Funcional', 'Funciones puras matematicas, inmutabilidad, sin efectos colaterales, recursion y funciones de orden superior', 'LISP, Haskell, Erlang'],
        ['Logico', 'Hechos y reglas; el motor resuelve por unificacion y retroceso (clausulas de Horn)', 'Prolog'],
        ['Heuristico', 'Soluciones aproximadas suficientemente buenas para problemas NP-completos/NP-hard; metaheuristicas', 'Lenguajes con bibliotecas geneticas/ACO (ILOG, frameworks)'],
        ['Concurrente', 'Procesos/hilos paralelos; exclusion mutua con semaforos, monitores, bloqueos; sincronizacion y deadlock', 'Ada, Java (threads), Erlang'],
        ['Orientado a objetos', 'Abstraccion, encapsulamiento, herencia y polimorfismo; objetos con estado y comportamiento', 'C++, Java, C#, Smalltalk'],
    ], [30*mm, None, 44*mm]))

    f.append(H2('6. Programacion web clasica'))
    f.append(H3('Nacimiento de la web'))
    f.append(P('<b>Tim Berners-Lee</b> (CERN, 1989-1991) crea la WWW sobre 3 pilares: <b>HTML</b> (formato de '
               'documentos hipertexto), <b>HTTP</b> (protocolo de transferencia, sin estado) y <b>URL</b> '
               '(direccionamiento universal). El navegador <b>Mosaic</b> (1993) populariza la web; Netscape '
               '(1994) y luego IE inician la primera guerra de navegadores.'))
    f.append(B('<b>HTML:</b> lenguaje de marcado por etiquetas derivado de SGML; versiones HTML 2.0 (1995), '
               'HTML 3.2, HTML 4.01 (1999, con hojas de estilo CSS separando contenido y presentacion).'))
    f.append(B('<b>JavaScript:</b> creado por Brendan Eich en Netscape (1995); lenguaje de script interpretado '
               'en el cliente; estandarizado como ECMAScript.'))
    f.append(B('<b>DHTML (Dynamic HTML):</b> no es un estandar sino la combinacion de <b>HTML + CSS + '
               'JavaScript + DOM</b> para modificar la pagina en el cliente sin recargarla.'))
    f.append(H3('PHP clasico con MySQL'))
    f.append(CODE('$cn = mysql_connect($host, $user, $pass);   // abre socket al servidor MySQL\n'
                  'mysql_select_db("arsenales", $cn);\n'
                  '$rs = mysql_query("SELECT * FROM personal", $cn);\n'
                  '// al finalizar el script el socket se CIERRA automaticamente\n'
                  '\n'
                  '$p = mysql_pconnect($host, $user, $pass);  // conexion PERSISTENTE:\n'
                  '// PHP la devuelve del pool de Apache si ya existe (no repite\n'
                  '// el handshake TCP ni la autenticacion al terminar el script)'))
    f.append(B('<b>Diferencia critica:</b> mysql_connect() cierra la conexion al finalizar el script; '
               'mysql_pconnect() la mantiene en el pool del servidor web para reutilizarla en peticiones '
               'posteriores (menor overhead, riesgo de saturar max_connections si se abusa).'))
    f.append(H3('ASP clasico con VBScript'))
    f.append(TBL(['Objeto intrinseco', 'Funcion'], [
        ['Request', 'Lee entrada del cliente: formularios, querystring, cookies'],
        ['Response', 'Escribe salida (Response.Write), redirecciones y cookies'],
        ['Application', 'Variables <b>globales compartidas por TODAS las sesiones</b> del proceso IIS (ej. contadores); bloqueadas con Lock/Unlock'],
        ['Session', 'Variables <b>privadas por usuario</b>, atadas a la cookie de sesion, con timeout (por defecto 20 min)'],
        ['Server', 'Utilidades: Server.CreateObject, Server.MapPath'],
    ], [34*mm, None]))
    f.append(NOTE('Bibliografia oficial de referencia (Programa CMN): V. J. Eslava Muñoz, <i>El nuevo PHP paso '
                  'a paso</i> y <i>El nuevo PHP. Conceptos avanzados</i> (2013) &middot; publicaciones de '
                  'referencia sobre HTML/DHTML/JavaScript y ASP-VBScript en IIS.'))
    build('Bibliografia_PilarC_Software_PHP_ASP.pdf',
          'Compendio C de estudio - Desarrollo de software y programacion web',
          'COMPENDIO C · DESARROLLO DE SOFTWARE Y PROGRAMACION',
          'UML, traductores, historia de los lenguajes, programacion estructurada, paradigmas y web clasica',
          DISCLAIMER, f)

# ============================================================ COMPENDIO D
def compendio_d():
    f = []
    f.append(H2('1. Etapas del diseno de bases de datos'))
    f.append(TBL(['Etapa', 'Entrada', 'Salida / artefacto'], [
        ['Conceptual', 'Requisitos del negocio', 'Modelo Entidad-Relacion (E-R): entidades, atributos, relaciones, cardinalidades'],
        ['Logico', 'Modelo E-R validado', 'Esquema relacional: tablas, claves primarias y foraneas (independiente del SGBD)'],
        ['Fisico', 'Esquema logico + carga estimada', 'Diseno de almacenamiento, particiones, indices, espacios de tabla; depende del SGBD'],
    ], [26*mm, 46*mm, None]))

    f.append(H2('2. Modelo Entidad-Relacion'))
    f.append(B('<b>Entidad:</b> objeto real o conceptual con existencia propia (OFICIAL, UNIDAD). <b>Instancia:</b> '
               'ocurrencia concreta. <b>Detalle o entidad debil:</b> no existe sin otra (ENTREGA_DETALLE).'))
    f.append(B('<b>Atributos:</b> propiedades. Identificador (clave) subrayado. Atributos simples, compuestos, '
               'multivaluados y derivados (edad deriva de fecha de nacimiento).'))
    f.append(H3('Representacion'))
    f.append(B('Entidad = rectangulo; relacion = rombo; atributo = ovalo; cardinalidad indicada con (0,1), (1,1), '
               '(0,N), (1,N) o notacion tipo crow-foot en variantes modernas.'))
    f.append(H3('Grado de una relacion'))
    f.append(TBL(['Grado', 'Definicion', 'Ejemplo'], [
        ['Unaria (1)', 'Relacion de una entidad consigo misma (reflexiva)', 'OFICIAL "reporta a" OFICIAL (jefe-subordinado)'],
        ['Binaria (2)', 'Entre dos entidades', 'OFICIAL "pertenece a" UNIDAD'],
        ['Ternaria (3)', 'Entre tres entidades simultaneamente', 'OFICIAL "opera" VEHICULO en ZONA'],
        ['N-aria', 'Entre N entidades', 'Descomponible o no segun dependencias de union'],
    ], [22*mm, 62*mm, None]))
    f.append(H3('Cardinalidad de una entidad'))
    f.append(TBL(['Cardinalidad', 'Significado', 'Ejemplo y reduccion'], [
        ['1:1', 'Un oficial tiene un credencial y cada credencial un oficial', 'PK compartida o FK unica (UNIQUE)'],
        ['1:N', 'Una UNIDAD tiene N oficiales; cada oficial pertenece a 1 unidad', 'La FK va del lado N hacia el lado 1: OFICIAL.CodUnidad'],
        ['N:M', 'N oficiales realizan M cursos; cada curso lo realizan N oficiales', 'Obliga a tabla puente: OFICIAL_CURSO(DNI, CodCurso)'],
    ], [22*mm, 58*mm, None]))

    f.append(H2('3. Modelo relacional'))
    f.append(B('<b>Relacion (tabla):</b> subconjunto del producto cartesiano de dominios. <b>Tupla:</b> fila. '
               '<b>Atributo:</b> columna. <b>Dominio:</b> conjunto de valores validos (tipo + restriccion).'))
    f.append(B('<b>Clave primaria (PK):</b> identificador unico, no nulo, no repetible. <b>Clave candidata:</b> '
               'todo atributo o combinacion que identifica univocamente. <b>Clave foranea (FK):</b> referencia '
               'a una PK de otra tabla (integridad referencial).'))
    f.append(B('<b>Vista (VIEW):</b> tabla virtual definida por una consulta; no almacena datos (salvo vistas '
               'materializadas); sirve para seguridad (ocultar columnas) y simplificar consultas.'))
    f.append(B('<b>Integridades:</b> de entidad (PK no nula), referencial (FK valida o NULL), de dominio '
               '(CHECK) y de usuario (reglas de negocio).'))

    f.append(H2('4. Normalizacion de 1FN a 5FN'))
    f.append(P('<b>Dependencia funcional (DF):</b> X &rarr; Y si cada valor de X determina un unico valor de Y. '
               'Es la base teorica de todas las formas normales.'))
    f.append(TBL(['Forma', 'Regla', 'Anomalia que elimina'], [
        ['1FN', 'Valores atomicos (sin grupos repetitivos ni arreglos); clave primaria obligatoria', 'Listas dentro de una celda'],
        ['2FN', '1FN + todo atributo no primo depende de la clave compuesta COMPLETA (sin dependencias parciales)', 'En ENTREGA(Id, CodItem, Fecha, NombreItem): NombreItem depende solo de CodItem'],
        ['3FN', '2FN + sin dependencias transitivas de atributos no clave (no-clave no determina no-clave)', 'OFICIAL(DNI, CodUnidad, NomUnidad): DNI &rarr; CodUnidad &rarr; NomUnidad'],
        ['BCNF', '3FN estricta: TODO determinante debe ser superclave', 'Tablas con dos claves candidatas compuestas superpuestas'],
        ['4FN', 'BCNF + sin dependencias multivaluadas no triviales independientes', 'OFICIAL(DNI, Curso, Idioma): DNI&#8608;Curso y DNI&#8608;Idioma generan producto cartesiano espurio; se divide en 2 tablas binarias'],
        ['5FN (PJNF)', '4FN + sin dependencias de UNION (join dependency): toda descomposicion valida es en proyecciones que se recomponen sin tuplas espurias', 'Regla ternaria ciclica (OFICIAL-VEHICULO-ZONA) que exige 3 proyecciones binarias: Teorema de Fagin'],
    ], [20*mm, 62*mm, None]))
    f.append(CODE('4FN - descomposicion (dependencias multivaluadas independientes):\n'
                  'OFICIAL_CURSO(DNI, CodCurso)\n'
                  'OFICIAL_IDIOMA(DNI, CodIdioma)\n'
                  '\n'
                  '5FN - regla ciclica ternaria (Teorema de Fagin):\n'
                  'Si para todo combo valido (proveedor, pieza, proyecto) se cumplen\n'
                  'las 3 proyecciones, la tabla ternaria se reemplaza por:\n'
                  'OFICIAL_VEHICULO | VEHICULO_ZONA | OFICIAL_ZONA'))
    f.append(NOTE('Las 3 primeras formas normales fueron propuestas por E. F. Codd (1971); BCNF por Codd y Raymond '
                  'Boyce; 4FN y 5FN (PJNF) por Ronald Fagin (1977, 1979).'))

    f.append(H2('5. T-SQL: consultas, tablas, vistas e indices'))
    f.append(H3('DDL con restricciones'))
    f.append(CODE('CREATE TABLE PERSONAL (\n'
                  '  DNI       INT           NOT NULL,\n'
                  '  Nombre    VARCHAR(60)   NOT NULL,\n'
                  '  CodUnidad SMALLINT      NULL,\n'
                  '  Grado     CHAR(2)       NOT NULL,\n'
                  '  CONSTRAINT PK_PERSONAL PRIMARY KEY (DNI),\n'
                  '  CONSTRAINT FK_UNIDAD FOREIGN KEY (CodUnidad) REFERENCES UNIDAD(CodUnidad),\n'
                  '  CONSTRAINT UQ_DNI UNIQUE (DNI),\n'
                  '  CONSTRAINT CK_GRADO CHECK (Grado IN (\'ST\', \'TE\', \'MY\'))\n'
                  ');'))
    f.append(H3('Seleccion, agrupacion y vistas'))
    f.append(CODE('-- WHERE filtra FILAS antes de agrupar; HAVING filtra GRUPOS despues\n'
                  'SELECT U.NomUnidad, COUNT(*) AS Personal, AVG(P.Antig) AS AntProm\n'
                  'FROM PERSONAL P JOIN UNIDAD U ON P.CodUnidad = U.CodUnidad\n'
                  'WHERE P.Baja = 0\n'
                  'GROUP BY U.NomUnidad\n'
                  'HAVING COUNT(*) > 10\n'
                  'ORDER BY AntProm DESC;\n'
                  '\n'
                  'CREATE VIEW vw_PersonalActivo AS\n'
                  'SELECT DNI, Nombre, CodUnidad FROM PERSONAL WHERE Baja = 0;'))
    f.append(H3('Indices en SQL Server'))
    f.append(TBL(['Criterio', 'CLUSTERED', 'NONCLUSTERED'], [
        ['Orden fisico', 'Define el orden REAL de las filas en disco', 'Estructura B+ independiente'],
        ['Cantidad', 'Maximo 1 por tabla (se crea por defecto con la PK)', 'Hasta 999 por tabla'],
        ['Hojas del arbol', 'Son las filas de datos reales', 'Son localizadores (RID o clave clustering)'],
        ['Costo de escritura', 'Alto (reordena fisicamente)', 'Moderado (mantiene otra estructura)'],
    ], [30*mm, 58*mm, None]))
    f.append(B('<b>DELETE</b> frente a <b>TRUNCATE</b>: DELETE borra fila por fila y registra cada una en el '
               'transaction log; admite WHERE y dispara triggers. TRUNCATE desasigna las paginas de datos '
               '(minimo registro), reinicia los contadores IDENTITY, no admite WHERE y es mucho mas veloz; '
               'no se usa si la tabla es referenciada por FK.'))
    f.append(H3('Transacciones'))
    f.append(CODE('BEGIN TRANSACTION;\n'
                  '  UPDATE ARSENAL SET Stock = Stock - 1 WHERE Id = 5;\n'
                  '  IF @@ERROR <> 0 ROLLBACK TRANSACTION;\n'
                  '  ELSE COMMIT TRANSACTION;\n'
                  '-- Propiedades ACID: Atomicidad, Consistencia, Aislamiento, Durabilidad'))
    f.append(NOTE('Bibliografia oficial de referencia (Programa CMN): M. V. Nevado Cabello, <i>Introduccion a las '
                  'Bases de Datos Relacionales</i> (Vision Libros) &middot; M. Y. Jimenez Capel, <i>Bases de datos '
                  'relacionales y modelado de datos. IFCT0310</i> (IC Editorial) &middot; P. Prescott, <i>SQL para '
                  'Principiantes</i> (Babelcube).'))
    build('Bibliografia_PilarD_BasesDeDatos_SQL.pdf',
          'Compendio D de estudio - Bases de datos y SQL',
          'COMPENDIO D · BASES DE DATOS Y SQL',
          'Diseno E-R, modelo relacional, normalizacion 1FN-5FN y T-SQL completo',
          DISCLAIMER, f)

if __name__ == '__main__':
    compendio_a()
    compendio_b()
    compendio_c()
    compendio_d()
    print('OK - 4 compendios generados en', OUT_DIR)
