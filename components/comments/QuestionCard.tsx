"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionForm } from "./QuestionForm";
import { MessageSquare, Trash2, Store } from "lucide-react";
import type { ProductQuestionWithAuthor } from "@/lib/types";

interface QuestionCardProps {
  question: ProductQuestionWithAuthor;
  currentUserId?: string;
  sellerId: string;
  onAnswer?: (questionId: string, content: string) => Promise<void>;
  onDelete?: (questionId: string) => void;
}

export function QuestionCard({
  question,
  currentUserId,
  sellerId,
  onAnswer,
  onDelete,
}: QuestionCardProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const isOwner = currentUserId === question.author_id;
  const isSeller = currentUserId === sellerId;
  const hasAnswers = question.answers && question.answers.length > 0;

  const authorName = question.author
    ? `${question.author.first_name || ""} ${question.author.last_name || ""}`.trim() ||
      "User"
    : "User";

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border bg-muted">
            {question.author?.avatar_url ? (
              <AvatarImage src={question.author.avatar_url} alt={authorName} />
            ) : (
              <AvatarFallback className="text-xs">
                {authorName[0] || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-0.5">
            <span className="font-semibold text-sm leading-none">
              {authorName}
            </span>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(question.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        {isOwner && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">{question.content}</p>

        {hasAnswers &&
          question.answers!.map((answer) => {
            const answerAuthorName = answer.author
              ? `${answer.author.first_name || ""} ${answer.author.last_name || ""}`.trim() ||
                "Seller"
              : "Seller";

            return (
              <div
                key={answer.id}
                className="bg-muted/50 border-l-2 border-primary p-3 rounded-r-md text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6 border bg-muted">
                    {answer.author?.avatar_url ? (
                      <AvatarImage
                        src={answer.author.avatar_url}
                        alt={answerAuthorName}
                      />
                    ) : (
                      <AvatarFallback className="text-[10px]">
                        {answerAuthorName[0] || "S"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-semibold text-sm">
                    {answerAuthorName}
                  </span>
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 h-5 text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    <Store className="w-3 h-3 mr-1" /> Seller
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(answer.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground">{answer.content}</p>
              </div>
            );
          })}

        {isSeller && !hasAnswers && onAnswer && (
          <>
            {showAnswerForm ? (
              <QuestionForm
                onSubmit={async (content) => {
                  await onAnswer(question.id, content);
                  setShowAnswerForm(false);
                }}
                onCancel={() => setShowAnswerForm(false)}
                placeholder="Write your answer..."
                submitLabel="Post Answer"
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowAnswerForm(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Answer
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
