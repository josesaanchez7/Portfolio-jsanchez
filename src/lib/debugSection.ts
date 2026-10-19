/**
 * Estilo del modo debug para una sección: borde discontinuo y etiqueta con su ancla (data-section).
 * Se activa cuando <html> lleva data-debug="true" (botón "Debug" de la barra de estado).
 */
export const DEBUG_SECTION = [
  "in-data-[debug=true]:relative",
  "in-data-[debug=true]:outline-2 in-data-[debug=true]:outline-dashed in-data-[debug=true]:outline-accent in-data-[debug=true]:-outline-offset-6",
  "in-data-[debug=true]:after:absolute in-data-[debug=true]:after:top-[10px] in-data-[debug=true]:after:left-[10px] in-data-[debug=true]:after:z-5",
  "in-data-[debug=true]:after:rounded-[4px] in-data-[debug=true]:after:bg-accent in-data-[debug=true]:after:px-[0.45rem] in-data-[debug=true]:after:py-[0.1rem]",
  "in-data-[debug=true]:after:font-code in-data-[debug=true]:after:text-[0.72rem] in-data-[debug=true]:after:leading-normal in-data-[debug=true]:after:text-accent-contrast",
  "in-data-[debug=true]:after:pointer-events-none in-data-[debug=true]:after:content-['#'_attr(data-section)]",
].join(" ");
