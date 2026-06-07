export function EmptyState() {
  return (
    <div className="py-14 text-center animate-[fadeIn_0.3s_ease]">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]
        grid place-items-center text-2xl text-white/20">
        🔍
      </div>
      <p className="text-sm text-white/35 font-normal">
        没有匹配结果，换个关键词试试。
      </p>
    </div>
  )
}
