import { Badge } from "./Badge";
import { formatClock } from "../lib/openingHours";

export function StatusPill({ status, compact = false }) {
  if (!status || !status.known) {
    return <Badge tone="warn">Horario no disponible</Badge>;
  }
  if (status.isOpen) {
    return (
      <Badge tone="open">
        Abierto{status.closesAt && !compact ? ` · cierra ${formatClock(status.closesAt)}` : ""}
      </Badge>
    );
  }
  return (
    <Badge tone="closed">
      Cerrado{status.opensAt && !compact ? ` · abre ${formatClock(status.opensAt)}` : ""}
    </Badge>
  );
}
