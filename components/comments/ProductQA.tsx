"use client";

import { useState, useEffect } from "react";
import { MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getQuestionsByProductId,
  createQuestion,
  createSellerAnswer,
  deleteQuestion,
} from "@/lib/data/comments";
import { QuestionCard } from "./QuestionCard";
import { QuestionForm } from "./QuestionForm";
import { toast } from "sonner";
import type { ProductQuestionWithAuthor } from "@/lib/types";

interface ProductQAProps {
  productId: string;
  currentUserId?: string;
  sellerId: string;
}

export function ProductQA({
  productId,
  currentUserId,
  sellerId,
}: ProductQAProps) {
  const [questions, setQuestions] = useState<ProductQuestionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const handleAskQuestion = async (content: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to ask a question.");
      return;
    }

    const { error } = await createQuestion(productId, currentUserId, content);
    if (error) {
      toast.error("Failed to post question.");
      return;
    }

    toast.success("Question posted!");
    setShowForm(false);
    fetchQuestions();
  };

  const handleAnswer = async (questionId: string, content: string) => {
    if (!currentUserId) return;

    const { error } = await createSellerAnswer(
      questionId,
      productId,
      currentUserId,
      content,
    );
    if (error) {
      toast.error("Failed to post answer.");
      return;
    }

    toast.success("Answer posted!");
    fetchQuestions();
  };

  const handleDelete = async (questionId: string) => {
    if (!currentUserId) return;

    const success = await deleteQuestion(questionId, currentUserId);
    if (success) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success("Question deleted.");
    } else {
      toast.error("Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12 border-t pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Questions & Answers ({questions.length})
        </h2>
        {currentUserId && currentUserId !== sellerId && (
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask a Question
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <QuestionForm
            onSubmit={handleAskQuestion}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div>
        {questions.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No questions yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
              Be the first to ask a question about this product.
            </p>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              currentUserId={currentUserId}
              sellerId={sellerId}
              onAnswer={handleAnswer}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
