import Input from "./Input";

export default function DateRangeFilter({ start, end, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        label="Desde"
        type="date"
        value={start}
        onChange={(event) => onChange({ start: event.target.value, end })}
      />
      <Input
        label="Hasta"
        type="date"
        value={end}
        onChange={(event) => onChange({ start, end: event.target.value })}
      />
    </div>
  );
}
