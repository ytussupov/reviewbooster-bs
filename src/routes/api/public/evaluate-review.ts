import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type EvalResult = {
  quality_score: number;
  rating: number;
  bonus_amount: number;
  ai_feedback: string;
};

function generateCoupon(amount: number) {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RB${amount}-${rand}`;
}

export const Route = createFileRoute("/api/public/evaluate-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            product_id?: string;
            author_name?: string;
            content?: string;
            product_name?: string;
            language?: "ru" | "kk" | "en";
          };

          const product_id = (body.product_id || "").trim();
          const author_name = (body.author_name || "").trim().slice(0, 60);
          const content = (body.content || "").trim().slice(0, 2000);
          const product_name = (body.product_name || "товар").slice(0, 200);
          const language = body.language === "kk" || body.language === "en" ? body.language : "ru";
          const langName = language === "ru" ? "русском" : language === "kk" ? "казахском" : "английском";

          if (!product_id || !author_name || content.length < 5) {
            return Response.json(
              { error: "Заполните имя и отзыв (минимум 5 символов)." },
              { status: 400 }
            );
          }

          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return Response.json({ error: "AI не настроен" }, { status: 500 });
          }

          const aiResp = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  {
                    role: "system",
                    content:
                      `Ты модератор отзывов. Оценивай отзыв о товаре по полезности, конкретике, конструктивности и подробности. Отвечай ТОЛЬКО через вызов функции evaluate_review. Шкала quality_score: 0-100. rating 1-5 — твоя оценка тональности отзыва (1 — крайне негативный, 5 — крайне позитивный). bonus_amount в рублях по правилу: <40→0, 40-59→100, 60-79→250, 80-89→500, 90+→1000. feedback — короткий комментарий автору на ${langName} языке (1-2 предложения), что хорошо/что улучшить.`,
                  },
                  {
                    role: "user",
                    content: `Товар: ${product_name}\n\nОтзыв от ${author_name}:\n"""${content}"""`,
                  },
                ],
                tools: [
                  {
                    type: "function",
                    function: {
                      name: "evaluate_review",
                      description: "Оценить отзыв",
                      parameters: {
                        type: "object",
                        properties: {
                          quality_score: { type: "integer", minimum: 0, maximum: 100 },
                          rating: { type: "integer", minimum: 1, maximum: 5 },
                          bonus_amount: { type: "integer", minimum: 0 },
                          feedback: { type: "string" },
                        },
                        required: ["quality_score", "rating", "bonus_amount", "feedback"],
                        additionalProperties: false,
                      },
                    },
                  },
                ],
                tool_choice: {
                  type: "function",
                  function: { name: "evaluate_review" },
                },
              }),
            }
          );

          if (!aiResp.ok) {
            if (aiResp.status === 429)
              return Response.json(
                { error: "Слишком много запросов, попробуйте позже." },
                { status: 429 }
              );
            if (aiResp.status === 402)
              return Response.json(
                { error: "Закончились AI-кредиты в воркспейсе." },
                { status: 402 }
              );
            const t = await aiResp.text();
            console.error("AI gateway error:", aiResp.status, t);
            return Response.json({ error: "Ошибка AI" }, { status: 500 });
          }

          const aiJson = await aiResp.json();
          const call =
            aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (!call) {
            console.error("No tool call:", JSON.stringify(aiJson).slice(0, 500));
            return Response.json({ error: "AI не вернул оценку" }, { status: 500 });
          }
          const parsed = JSON.parse(call) as {
            quality_score: number;
            rating: number;
            bonus_amount: number;
            feedback: string;
          };

          const result: EvalResult = {
            quality_score: Math.max(0, Math.min(100, parsed.quality_score | 0)),
            rating: Math.max(1, Math.min(5, parsed.rating | 0)),
            bonus_amount: Math.max(0, parsed.bonus_amount | 0),
            ai_feedback: String(parsed.feedback || "").slice(0, 400),
          };

          const coupon =
            result.bonus_amount > 0 ? generateCoupon(result.bonus_amount) : null;

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("reviews")
            .insert({
              product_id,
              author_name,
              content,
              rating: result.rating,
              quality_score: result.quality_score,
              bonus_amount: result.bonus_amount,
              ai_feedback: result.ai_feedback,
              coupon_code: coupon,
            })
            .select()
            .single();

          if (insErr) {
            console.error(insErr);
            return Response.json(
              { error: "Не удалось сохранить отзыв" },
              { status: 500 }
            );
          }

          return Response.json({ review: inserted });
        } catch (e) {
          console.error("evaluate-review crash:", e);
          return Response.json({ error: "Внутренняя ошибка" }, { status: 500 });
        }
      },
    },
  },
});
