const PDFS = {
  'AM': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-AM.pdf',
  'A1/A2': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-A1-Y-A2.pdf',
  'B': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-B.pdf',
  'C1/C': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-C1-C.pdf',
  'D1/D': 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/para-colaboradores-y-empresas/autoescuelas/CUADERNILLO-FORMACION-DGT-PERMISOS-D1-y-D.pdf'
};

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const permit = url.searchParams.get('permit') || '';
  const source = PDFS[permit];
  if (!source) return new Response('Permiso no válido', { status: 400 });

  const upstream = await fetch(source, {
    headers: { 'User-Agent': 'FichaAutoescuela/1.0' },
    cf: { cacheTtl: 86400, cacheEverything: true }
  });
  if (!upstream.ok) return new Response('No se pudo obtener el PDF oficial', { status: 502 });

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'application/pdf');
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  headers.set('Content-Disposition', `inline; filename="DGT-${permit.replaceAll('/', '-')}.pdf"`);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(upstream.body, { status: 200, headers });
}
