//ask-ai.js
export default async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({
            error: 'GROQ_API_KEY no esta configurada en las variables de entorno de Netlify'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { question, articleTitle, articleContent, history } = await req.json();

        if (!question || typeof question !== 'string') {
            return new Response(JSON.stringify({ error: 'Falta la pregunta' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const MAX_CONTEXT_CHARS = 4000;
        const safeArticleContent = (articleContent || '').slice(0, MAX_CONTEXT_CHARS);

        const systemPrompt = `Eres "Clint", un asistente dentro de Identiccionary, una plataforma pensada para ayudar a padres, madres, profesores y encargados a entender terminos e identidades de sus hijos/estudiantes.

Tu unico trabajo es responder preguntas sobre el articulo que el usuario esta leyendo actualmente. Responde en español, de forma clara, calmada y empatica, pensando en que quien pregunta puede estar confundido o preocupado por su hijo/a.

No inventes informacion que no este en el articulo. Si la pregunta no se puede responder con el contenido del articulo, dilo honestamente y ofrece una respuesta general basada en lo que sepas, aclarando que no proviene del articulo.

Se breve, maximo 2-3 oraciones por respuesta.

Articulo actual: "${articleTitle || 'Sin titulo'}"

Contenido del articulo:
${safeArticleContent}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(Array.isArray(history) ? history.slice(-10) : []),
            { role: 'user', content: question }
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                max_tokens: 400,
                temperature: 0.5
            })
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error('Groq API error:', groqRes.status, errText);

            if (groqRes.status === 429) {
                return new Response(JSON.stringify({
                    error: 'Se alcanzo el limite de uso gratuito por ahora, intenta de nuevo en un momento'
                }), {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            throw new Error(`Groq respondio con status ${groqRes.status}`);
        }

        const data = await groqRes.json();
        const answer = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';

        return new Response(JSON.stringify({ answer }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Error en ask-ai function:', err);
        return new Response(JSON.stringify({ error: 'Ocurrio un error al consultar a ClintAI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};