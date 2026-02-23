"use client";

import { useEffect, useState } from "react";
import {
  getQuestionsByProductId,
  createSellerAnswer,
} from "@/lib/data/comments";
import { QuestionCard } from "./QuestionCard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProductQuestionWithAuthor } from "@/lib/types";

interface SellerQATabProps {
  productId: string;
  sellerId: string;
}

export function SellerQATab({ productId, sellerId }: SellerQATabProps) {
  const [questions, setQuestions] = useState<ProductQuestionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestionsByProductId(productId);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const handleAnswer = async (questionId: string, content: string) => {
    const { error } = await createSellerAnswer(
      questionId,
      productId,
      sellerId,
      content,
    );
    if (error) {
      toast.error("Failed to post answer.");
      return;
    }
    toast.success("Answer posted!");
    fetchQuestions();
  };

  const unansweredCount = questions.filter(
    (q) => !q.answers || q.answers.length === 0,
  ).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        No questions have been asked about this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unansweredCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <Badge className="bg-amber-500 text-white">{unansweredCount}</Badge>
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {unansweredCount === 1
              ? "question needs"
              : "questions need"}{" "}
            your response
          </span>
        </div>
      )}

      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          currentUserId={sellerId}
          sellerId={sellerId}
          onAnswer={handleAnswer}
        />
      ))}
    </div>
  );
}
