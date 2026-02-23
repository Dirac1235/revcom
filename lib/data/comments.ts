import { createClient } from "@/lib/supabase/client";
import type { ProductQuestionWithAuthor } from "@/lib/types";

export async function getQuestionsByProductId(
  productId: string,
): Promise<ProductQuestionWithAuthor[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_qa")
    .select(
      `
      *,
      author:profiles!author_id(*)
    `,
    )
    .eq("product_id", productId)
    .is("parent_id", null)
    .eq("is_seller_answer", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  const questions = data as ProductQuestionWithAuthor[];

  const questionIds = questions.map((q) => q.id);
  if (questionIds.length === 0) return questions;

  const { data: answers, error: answersError } = await supabase
    .from("product_qa")
    .select(
      `
      *,
      author:profiles!author_id(*)
    `,
    )
    .in("parent_id", questionIds)
    .eq("is_seller_answer", true)
    .order("created_at", { ascending: true });

  if (answersError) {
    console.error("Error fetching answers:", answersError);
    return questions;
  }

  const answersByParent = new Map<string, ProductQuestionWithAuthor[]>();
  for (const answer of answers as ProductQuestionWithAuthor[]) {
    const list = answersByParent.get(answer.parent_id!) || [];
    list.push(answer);
    answersByParent.set(answer.parent_id!, list);
  }

  return questions.map((q) => ({
    ...q,
    answers: answersByParent.get(q.id) || [],
  }));
}

export async function createQuestion(
  productId: string,
  authorId: string,
  content: string,
): Promise<{ data: ProductQuestionWithAuthor | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_qa")
    .insert({
      product_id: productId,
      author_id: authorId,
      content,
      is_seller_answer: false,
    })
    .select(
      `
      *,
      author:profiles!author_id(*)
    `,
    )
    .single();

  if (error) {
    console.error("Error creating question:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProductQuestionWithAuthor, error: null };
}

export async function createSellerAnswer(
  questionId: string,
  productId: string,
  authorId: string,
  content: string,
): Promise<{ data: ProductQuestionWithAuthor | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_qa")
    .insert({
      product_id: productId,
      author_id: authorId,
      content,
      is_seller_answer: true,
      parent_id: questionId,
    })
    .select(
      `
      *,
      author:profiles!author_id(*)
    `,
    )
    .single();

  if (error) {
    console.error("Error creating seller answer:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProductQuestionWithAuthor, error: null };
}

export async function deleteQuestion(
  questionId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("product_qa")
    .delete()
    .eq("id", questionId)
    .eq("author_id", userId);

  if (error) {
    console.error("Error deleting question:", error);
    return false;
  }

  return true;
}
