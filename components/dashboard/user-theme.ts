export const userCardClass =
  'border-border/70 bg-card/95 shadow-sm supports-[backdrop-filter]:bg-card/90'

export const userPanelClass =
  'rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/30'

export const userActionButtonClass =
  'rounded-lg bg-primary text-primary-foreground hover:bg-primary/90'

export const userOutlineButtonClass =
  'rounded-lg border-border/70 bg-background/60 hover:bg-muted/60'

export const userStatusClassMap: Record<string, string> = {
  active:
    'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  operational:
    'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  maintenance:
    'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  needs_maintenance:
    'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  under_repair:
    'border-blue-500/35 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  decommissioned:
    'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  pending:
    'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  approved:
    'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  rejected:
    'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export function resolveUserStatusClass(status: string) {
  return (
    userStatusClassMap[status] ||
    'border-slate-500/35 bg-slate-500/10 text-slate-700 dark:text-slate-300'
  )
}
