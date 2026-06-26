export default async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: 'GROQ_API_KEY no configurada' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { quizTitle, quizDescription, mainQuestion, answersText } = await req.json();

        if (!answersText || !mainQuestion) {
            return new Response(JSON.stringify({ error: 'Faltan datos del quiz' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const systemPrompt = `Eres "Clint", un asistente dentro de Identiccionary, una plataforma pensada para ayudar a padres, madres, profesores y encargados a entender terminos e identidades de sus hijos/estudiantes.

Tu unica tarea es analizar las respuestas proporcionadas por el usuario a un quiz y generar un resultado basado exclusivamente en dichas respuestas.

Informacion del quiz:
- Nombre: "${quizTitle}"
- Descripcion: "${quizDescription}"
- Pregunta principal: "${mainQuestion}"

Debes responder a la pregunta principal utilizando únicamente la información obtenida de las respuestas del usuario. No inventes información adicional ni hagas afirmaciones que no puedan inferirse razonablemente de las respuestas.

Si las respuestas no permiten llegar a una conclusión clara, indica incertidumbre (por ejemplo: "Es posible que..." o "No hay suficiente información para determinarlo con certeza").

Tu respuesta debe ser UNICAMENTE un objeto JSON válido con esta estructura:

{
    "titleRes": "...",
    "explanationRes": "..."
}

Reglas:
- "titleRes" debe ser una respuesta corta que responda directamente a la pregunta principal.
- Evita afirmaciones absolutas cuando el resultado sea incierto.
- "explanationRes" debe contener una explicación amigable y breve que hable directamente con el usuario y que justifique/explique el resultado.
- "explanationRes" debe tener como máximo 2 oraciones.
- No incluyas texto adicional fuera del JSON.

Estas son las respuestas del usuario:
${answersText}`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: systemPrompt }],
                max_tokens: 300,
                temperature: 0.4
            })
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error('Groq error:', groqRes.status, errText);

            if (groqRes.status === 429) {
                return new Response(JSON.stringify({
                    error: 'Límite de uso alcanzado, intenta en un momento'
                }), { status: 429, headers: { 'Content-Type': 'application/json' } });
            }
            throw new Error(`Groq status ${groqRes.status}`);
        }

        const groqData = await groqRes.json();
        const raw = groqData.choices?.[0]?.message?.content || '{}';

        let parsed;
        try {
            parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : { titleRes: 'Sin resultado', explanationRes: raw };
        }

        return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch(err) {
        console.error('Error en ask-quiz:', err);
        return new Response(JSON.stringify({ error: 'Error al procesar el quiz' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};