import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// System prompt for Ticpin assistant
const SYSTEM_PROMPT = `You are "Ticpin AI" - the ultimate premium expert guide for the Ticpin booking platform.
Always Online. Always Ready.

Your mission is to provide extremely helpful, precise, and structured answers about events, tickets, venues, timings, pricing, and guidelines available on Ticpin.

RESPONSE FORMAT RULES:
1. USE LISTS: Present information point-by-point.
2. USE VISUAL MARKERS: Emojis like 🎫, 📍, 🕒, 🎟️, 💳, ℹ️, 📍.
3. PRECISE DATA: Always answer using the exact event details provided in the system context (ticket prices, venue name, address, date, time, age limit, facilities, rules).
4. TONE: Friendly, helpful, concise, and professional.
5. NO MARKDOWN BOLD: Avoid heavy formatting syntax; keep text clean and readable.

If a user asks about ticket prices, venue, timings, or rules, quote the exact details from the Approved Events database.
If a user asks about anything unrelated to Ticpin or events, politely direct them back to Ticpin services.`;

function generateSmartFallbackAnswer(userMessage: string, eventsData: any[], conversationHistory: any[] = []): string {
    const q = userMessage.toLowerCase();
    
    // Check if conversation history has event context
    const eventContextMsg = conversationHistory.find(m => typeof m.text === 'string' && m.text.includes('Event Details:'));
    let contextData: any = null;
    if (eventContextMsg && typeof eventContextMsg.text === 'string') {
        try {
            const raw = eventContextMsg.text.replace('Event Details:', '').trim();
            contextData = JSON.parse(raw);
        } catch (e) {}
    }

    const event = contextData || (eventsData.length > 0 ? eventsData[0] : null);

    if (event) {
        const name = event.name || 'Event';

        if (q.includes('price') || q.includes('ticket') || q.includes('cost') || q.includes('rate') || q.includes('fee')) {
            const cats = event.ticket_categories || event.ticketCategories || [];
            if (cats.length > 0) {
                const categoryList = cats.map((c: any) => `🎫 ${c.name}: ₹${c.price || event.price_starts_from || 0}`).join('\n');
                return `Ticket pricing for ${name}:\n\n${categoryList}\n\nMinimum starting price: ₹${event.price_starts_from || cats[0]?.price || 0}\n\nSelect your preferred category to proceed with booking!`;
            } else if (event.price_starts_from) {
                return `Ticket prices for ${name} start from ₹${event.price_starts_from}.\n\nClick 'Book Tickets' to choose your tickets!`;
            }
        }

        if (q.includes('where') || q.includes('venue') || q.includes('location') || q.includes('address') || q.includes('map') || q.includes('place')) {
            const vName = event.venue_name || event.venueName || 'Venue';
            const vAddr = event.venue_address || event.venueAddress || '';
            const city = event.city || '';
            const fullLocation = [vName, vAddr, city].filter(Boolean).join(', ');
            return `📍 Venue Details for ${name}:\n\nLocation: ${fullLocation}\n\nCity: ${city || 'N/A'}`;
        }

        if (q.includes('time') || q.includes('gate') || q.includes('open') || q.includes('when') || q.includes('date') || q.includes('schedule') || q.includes('duration')) {
            const dateStr = event.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
            const timeStr = event.time || 'TBA';
            const duration = event.duration ? `Duration: ${event.duration}` : '';
            const gates = event.guide?.gates_open_before_value ? `Gates open ${event.guide.gates_open_before_value} ${event.guide.gates_open_before_unit || 'minutes'} before event time.` : 'Gates open 1 hour before start time.';
            return `🕒 Timing & Date for ${name}:\n\n📅 Date: ${dateStr}\n⏰ Event Time: ${timeStr}\n🚪 Gate Opening: ${gates}\n${duration}`;
        }

        if (q.includes('kid') || q.includes('age') || q.includes('child') || q.includes('family') || q.includes('pet') || q.includes('facility') || q.includes('rule') || q.includes('guideline') || q.includes('amenity')) {
            const age = event.age_limit || (event.guide?.min_age ? `${event.guide.min_age}+ years` : 'Open to all ages');
            const kidFriendly = event.guide?.is_kid_friendly ? 'Yes, kid friendly' : 'Check age policy at entrance';
            const petFriendly = event.guide?.is_pet_friendly ? 'Pets allowed' : 'Pets not allowed';
            const facilities = Array.isArray(event.guide?.facilities) ? event.guide.facilities.join(', ') : (event.guide?.facilities || 'Standard venue amenities');
            return `ℹ️ Event Guidelines for ${name}:\n\n👶 Age Limit: ${age}\n👨‍👩‍👧 Kid Policy: ${kidFriendly}\n🐾 Pet Policy: ${petFriendly}\n🚗 Facilities: ${facilities}`;
        }
    }

    if (eventsData.length > 0) {
        const approvedList = eventsData.slice(0, 5).map(e => `🎫 ${e.name} (${e.city || 'Live'}) - Starts @ ₹${e.price_starts_from || 0}`).join('\n');
        return `Here are the currently active & approved events on Ticpin:\n\n${approvedList}\n\nAsk me anything about ticket prices, venue, gate opening times, or age limits!`;
    }

    return "Hello! I am Ticpin AI. You can explore all live events, ticket prices, and venues using the main navigation bar. Let me know if you have questions about event timings, ticket rates, or venues!";
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, conversationHistory = [], sessionId, userData, isEventQuery } = body;

        // Session check to prevent unauthorized external spam
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('__Host-ticpin_user_session');
        const organizerCookie = cookieStore.get('__Host-ticpin_session');
        
        if (!sessionCookie && !organizerCookie && !isEventQuery) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch current approved events from Go backend
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:9000';

        // 1. Save user message to Go backend if sessionId is present
        if (sessionId && userData) {
            try {
                const formData = new FormData();
                formData.append('userId', userData.id || 'guest');
                formData.append('userEmail', userData.email || 'guest@ticpin.in');
                formData.append('userType', userData.type || 'user');
                formData.append('message', message);
                formData.append('sender', 'user');

                await fetch(`${baseUrl}/api/chat/sessions/${sessionId}/messages`, {
                    method: 'POST',
                    body: formData
                });
            } catch (e) {
                console.error('Error saving user message to DB:', e);
            }
        }

        // Fetch full approved events data
        let approvedEvents: any[] = [];
        try {
            const evRes = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' });
            if (evRes.ok) {
                const d = await evRes.json();
                const list = Array.isArray(d) ? d : (d.data || []);
                approvedEvents = list.filter((e: any) => !e.status || e.status.toLowerCase() === 'approved');
            }
        } catch (e) {
            console.error('Error fetching approved events for Groq AI context:', e);
        }

        // Build comprehensive event context
        const formattedEventsContext = approvedEvents.map((e: any) => ({
            id: e.id,
            name: e.name,
            category: e.category || e.event_category,
            city: e.city,
            venue_name: e.venue_name,
            venue_address: e.venue_address,
            date: e.date,
            time: e.time,
            duration: e.duration,
            price_starts_from: e.price_starts_from,
            ticket_categories: (e.ticket_categories || []).map((tc: any) => ({
                name: tc.name,
                price: tc.price,
                capacity: tc.capacity
            })),
            artists: (e.artists || []).map((a: any) => a.name),
            age_limit: e.age_limit,
            language: e.language,
            guide: e.guide,
            event_instructions: e.event_instructions,
            terms: e.terms,
            faqs: e.faqs
        }));

        const contextString = `\n\nOFFICIAL APPROVED EVENTS DATABASE:\n${JSON.stringify(formattedEventsContext, null, 2)}\n`;

        // Prepare messages for LLM
        const messages = [
            { role: "system", content: SYSTEM_PROMPT + contextString },
            ...conversationHistory.map((msg: any) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text || msg.message || ""
            })),
            { role: "user", content: message }
        ];

        // Call Groq API with valid model names and keys
        const groqApiKeys = [
            GROQ_API_KEY,
            "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",
            "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"
        ].filter(Boolean) as string[];

        const validModels = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768"
        ];

        let groqResponse: Response | null = null;

        for (const key of groqApiKeys) {
            for (const model of validModels) {
                try {
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages,
                            temperature: 0.7,
                            max_completion_tokens: 1024,
                            top_p: 1,
                            stream: true
                        })
                    });

                    if (res.ok) {
                        groqResponse = res;
                        break;
                    }
                } catch (e) {}
            }
            if (groqResponse) break;
        }

        // If Groq API call didn't return a stream (keys expired or network offline), stream smart event-aware fallback!
        if (!groqResponse) {
            const fallbackText = generateSmartFallbackAnswer(message, approvedEvents, conversationHistory);
            const encoder = new TextEncoder();
            const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: fallbackText } }] })}\n\ndata: [DONE]\n\n`;
            return new Response(new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(chunk));
                    controller.close();
                }
            }), {
                headers: { 
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        }

        // Stream real LLM response
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullAiResponse = '';

        return new Response(new ReadableStream({
            async start(controller) {
                const reader = groqResponse!.body?.getReader();
                if (!reader) return;

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        controller.enqueue(encoder.encode(chunk));

                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') continue;
                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content || '';
                                    fullAiResponse += content;
                                } catch (e) { }
                            }
                        }
                    }
                } catch (e) {
                    controller.error(e);
                } finally {
                    // Save full AI response to DB
                    if (sessionId && userData && fullAiResponse) {
                        try {
                            const formData = new FormData();
                            formData.append('userId', userData.id || 'guest');
                            formData.append('userEmail', userData.email || 'guest@ticpin.in');
                            formData.append('userType', userData.type || 'user');
                            formData.append('message', fullAiResponse);
                            formData.append('sender', 'admin');

                            await fetch(`${baseUrl}/api/chat/sessions/${sessionId}/messages`, {
                                method: 'POST',
                                body: formData
                            });
                        } catch (e) {
                            console.error('Error saving AI response to DB:', e);
                        }
                    }
                    controller.close();
                }
            }
        }), {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error: any) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
