import json
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the CSS to include styles for fallback banner, doc cards, and resource boxes
new_css = """
.video-fallback-banner {
  background: rgba(59, 130, 246, 0.08);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  font-size: 11.5px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.45;
}
.video-resources-box {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 10px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.video-resource-link {
  font-size: 10.5px;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  font-weight: 500;
}
.video-resource-link:hover {
  text-decoration: underline;
}
.doc-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  transition: border-color 0.18s, transform 0.15s;
}
.doc-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
}
"""

if '.video-fallback-banner' not in html:
    html = html.replace('.video-modal-head {', new_css + '\n.video-modal-head {', 1)

# 2. Update Modal HTML
old_modal_pattern = r'<!-- VISOR VIDEO YOUTUBE -->[\s\S]*?<!-- HEADER -->'
new_modal_html = """<!-- VISOR VIDEO YOUTUBE -->
<div id="videoOverlay" onclick="if(event.target===this)app.cerrarVideo()">
  <div class="video-modal">
    <div class="video-modal-head">
      <div>
        <div class="video-modal-title" id="videoTitle">Título de la Clase</div>
        <div class="video-modal-sub" id="videoSub">Canal &bull; Duración &bull; Pilar</div>
      </div>
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
        <a class="btn btn-sm btn-primary" id="videoOpenYt" href="#" target="_blank" rel="noopener" title="Ver directamente en la web de YouTube">Abrir en YouTube ↗</a>
        <a class="btn btn-sm" id="videoOpenBackup" href="#" target="_blank" rel="noopener" style="display:none;" title="Ver clase alternativa recomendada">Video Alternativo ↗</a>
        <a class="btn btn-sm" id="videoOpenDoc" href="#" target="_blank" rel="noopener" style="display:none;" title="Abrir documentación técnica oficial">Docs Oficiales ↗</a>
        <button class="btn btn-sm" id="videoTogglePlayer" onclick="app.toggleEmbedMode()" title="Alternar entre servidores de reproducción">Alternar Servidor</button>
        <button class="btn btn-sm" onclick="app.cerrarVideo()" title="Cerrar modal (o presiona Escape)">Cerrar (Esc)</button>
      </div>
    </div>
    
    <!-- BANNER DE RESILIENCIA Y SOPORTE OFICIAL -->
    <div class="video-fallback-banner" id="videoFallbackBanner">
      <svg style="width:16px; height:16px; flex-shrink:0; color:var(--accent);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <div>
        <strong>¿Problemas para reproducir dentro del navegador?</strong> Si YouTube muestra <em>"Video no disponible"</em> por extensiones, modo incógnito o políticas de privacidad, pulsa <a href="#" id="videoDirectLinkNotice" target="_blank" rel="noopener" style="color:var(--accent); font-weight:700; text-decoration:underline;">Abrir directamente en YouTube ↗</a> o utiliza <strong>Video Alternativo ↗</strong> y los <strong>Docs Oficiales</strong> del tema.
      </div>
    </div>

    <div class="video-frame-wrap">
      <iframe id="videoIframe" src="" title="Reproductor de Video Magistral" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
    <div class="video-details" id="videoDetails"></div>
  </div>
</div>

<!-- HEADER -->"""

html = re.sub(old_modal_pattern, new_modal_html, html, count=1)

# 3. Update Bibliografía Tab with Section 3: Official Technical Portals & Sandboxes
old_biblio_end = r'<!-- 4\. TEORÍA -->'
new_biblio_section = """    <!-- PORTALES OFICIALES Y DOCUMENTACIÓN TÉCNICA -->
    <div class="divider-lbl" style="margin-top:20px;">3 · PORTALES Y DOCUMENTACIÓN OFICIAL DE CONSULTA TÉCNICA (ACCESO DIRECTO Y GRATUITO)</div>
    <div class="grid-2" style="margin-bottom:14px;">
      <div class="doc-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="tag tag-blue">MICROSOFT LEARN</span>
            <span style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">Oficial MS</span>
          </div>
          <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">Windows Server, Active Directory y T-SQL</div>
          <div style="font-size:11.5px; color:var(--text-muted); line-height:1.5;">
            Documentación oficial completa sobre Active Directory Domain Services, roles FSMO, replicación intrasitio/intersitio, estrategia AGDLP, permisos NTFS, Print Spooler, DNS integrado, DHCP (ciclo DORA) y referencia T-SQL.
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a class="btn btn-sm btn-primary" href="https://learn.microsoft.com/es-es/windows-server/" target="_blank" rel="noopener">Windows Server Hub ↗</a>
          <a class="btn btn-sm" href="https://learn.microsoft.com/es-es/troubleshoot/windows-server/active-directory/fsmo-roles" target="_blank" rel="noopener">Roles FSMO ↗</a>
          <a class="btn btn-sm" href="https://learn.microsoft.com/es-es/sql/t-sql/language-reference" target="_blank" rel="noopener">T-SQL Oficial ↗</a>
        </div>
      </div>

      <div class="doc-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="tag tag-green">CISCO NETWORKING</span>
            <span style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">Cisco Systems</span>
          </div>
          <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">Modelo OSI, Ruteo OSPF/RIP y Tecnologías WAN</div>
          <div style="font-size:11.5px; color:var(--text-muted); line-height:1.5;">
            Guías de diseño y whitepapers técnicos de Cisco sobre las 7 capas del Modelo OSI frente a TCP/IP, tablas CAM/MAC en conmutación, algoritmos de enrutamiento (Dijkstra SPF vs Vector Distancia), y protocolos WAN (HDLC, PPP, Frame Relay).
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a class="btn btn-sm btn-primary" href="https://www.cisco.com/c/es_mx/support/docs/ip/routing-information-protocol-rip/13769-5.html" target="_blank" rel="noopener">Modelo OSI Cisco ↗</a>
          <a class="btn btn-sm" href="https://www.cisco.com/c/es_mx/support/docs/ip/border-gateway-protocol-bgp/15894-admin-dist.html" target="_blank" rel="noopener">Distancias Administrativas ↗</a>
          <a class="btn btn-sm" href="https://datatracker.ietf.org/doc/html/rfc1918" target="_blank" rel="noopener">RFC 1918 (IPs Privadas) ↗</a>
        </div>
      </div>

      <div class="doc-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="tag tag-amber">MDN WEB DOCS</span>
            <span style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">Mozilla Foundation</span>
          </div>
          <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">Arquitectura Web, Protocolo HTTP y DOM</div>
          <div style="font-size:11.5px; color:var(--text-muted); line-height:1.5;">
            El estándar de facto para desarrollo frontend y cliente-servidor: Funcionamiento del protocolo HTTP (métodos, cabeceras, códigos 1xx a 5xx), Document Object Model (DOM), ciclo de eventos en JavaScript y arquitectura cliente-servidor web.
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a class="btn btn-sm btn-primary" href="https://developer.mozilla.org/es/docs/Web/HTTP" target="_blank" rel="noopener">Guía HTTP en MDN ↗</a>
          <a class="btn btn-sm" href="https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction" target="_blank" rel="noopener">Árbol del DOM ↗</a>
          <a class="btn btn-sm" href="https://www.php.net/manual/es/" target="_blank" rel="noopener">Manual Oficial PHP ↗</a>
        </div>
      </div>

      <div class="doc-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="tag" style="background:rgba(236,72,153,0.15); color:#f472b6; border:1px solid rgba(236,72,153,0.3);">SIMULADORES Y PRÁCTICA</span>
            <span style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">Interactivo</span>
          </div>
          <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">Consolas Online de SQL, Subnetting y UML</div>
          <div style="font-size:11.5px; color:var(--text-muted); line-height:1.5;">
            Herramientas web libres para experimentar sin instalar software local: Consola SQL Fiddle y DB-Fiddle para consultas y triggers; calculadoras avanzadas de subnetting IPv4/VLSM; y editor en tiempo real de diagramas UML (PlantUML / Draw.io).
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <a class="btn btn-sm btn-primary" href="https://sqlfiddle.com/" target="_blank" rel="noopener">SQL Fiddle ↗</a>
          <a class="btn btn-sm" href="https://www.subnet-calculator.com/" target="_blank" rel="noopener">Subnet Calculator ↗</a>
          <a class="btn btn-sm" href="https://www.plantuml.com/plantuml/uml/" target="_blank" rel="noopener">PlantUML Server ↗</a>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. TEORÍA -->"""

html = html.replace(old_biblio_end, new_biblio_section, 1)

# Write updated HTML
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Modal and Bibliografía updated successfully in index.html!")
