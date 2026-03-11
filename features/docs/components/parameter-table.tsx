import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Parameter, parameters } from "../data/parameters";

function RequiredBadge({ required }: { required: boolean }) {
  if (required) {
    return <Badge variant="default">Required</Badge>;
  }
  return <Badge variant="secondary">Optional</Badge>;
}

function ParameterRow({ param }: { param: Parameter }) {
  return (
    <TableRow>
      <TableCell className="font-mono font-semibold">{param.name}</TableCell>
      <TableCell className="text-muted-foreground">{param.type}</TableCell>
      <TableCell>
        <RequiredBadge required={param.required} />
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">
        {param.default ?? "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {param.validation}
      </TableCell>
      <TableCell>{param.description}</TableCell>
    </TableRow>
  );
}

export function ParameterTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>Validation</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((param) => (
          <ParameterRow key={param.name} param={param} />
        ))}
      </TableBody>
    </Table>
  );
}
