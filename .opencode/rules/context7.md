# Context7 MCP — Documentation & Code Examples

Tienes acceso a Context7 a través de las herramientas `context7_resolve-library-id` y `context7_query-docs`.

## Cuándo usarlo

Úsalo cuando necesites documentación actualizada, ejemplos de código, o mejores prácticas para librerías y frameworks — especialmente si:

- La librería tiene una API extensa y no estás seguro de la firma exacta
- Necesitas ejemplos de patrones comunes (autenticación, paginación, manejo de errores, etc.)
- Quieres conocer la forma recomendada de hacer algo en una versión específica
- La información en tu conocimiento de base puede estar desactualizada

## Cómo usarlo

1. Llama a `context7_resolve-library-id` con el nombre exacto del paquete (ej. `"TanStack Query"`, `"Tailwind CSS"`, `"Zod"`).
2. Usa el `libraryId` devuelto (formato `/org/project`) para llamar a `context7_query-docs` con tu pregunta específica.
3. Si el usuario menciona una versión concreta, pásala en el `libraryId` (ej. `/vercel/next.js/v14`).

## Buenas prácticas

- Sé específico en las queries: en lugar de "React Router", pregunta "How to define nested routes with layout outlet in React Router v7".
- Prefiere consultas que resuelvan dudas concretas de implementación antes de escribir código.
- Si una query no devuelve resultados útiles, reformula la pregunta o prueba con menos términos.
- No más de 3 llamadas a `context7_query-docs` por pregunta.
- Siempre resuelve el libraryId primero (a menos que el usuario ya lo haya proporcionado en formato `/org/project`).
