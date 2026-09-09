export function SimilarityIndicator({ score }: { score: number }) {
  const label = score >= 0.8 ? '유사도 높음' : score >= 0.6 ? '유사도 보통' : '유사도 낮음';
  return (
    <p className="caption">
      {label}
      <span className="sr-only">{` 점수 ${score.toFixed(2)}`}</span>
    </p>
  );
}
