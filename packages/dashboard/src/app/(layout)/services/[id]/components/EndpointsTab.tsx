import { Tables } from "../../../../../utils/supabase/database.types";
import { NoEndpointsData } from "./NoEndpointsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { ColorSquare } from "../../../../../components/ColorSquare";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import { MethodBadge } from "../../../../../components/MethodBadge";

type Props = {
    endpoints: Tables<'endpoints'>[] | null,
    service: Tables<'services'>
}


export const EndpointsTab = ({ endpoints, service }: Props) => {

    return (<div>{endpoints?.length ? <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Full URL</TableHead>
                <TableHead className="text-right w-[100px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {endpoints?.map((endpoint) => (
                <TableRow key={endpoint.id}>
                    <TableCell>
                        <ColorSquare name={endpoint.name} />
                    </TableCell>
                    <TableCell className="font-medium">{endpoint.name}</TableCell>
                    <TableCell>
                        <MethodBadge method={endpoint.method} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{endpoint.full_url}</TableCell>
                    <TableCell className="text-right">
                        <Link href={`/services/${service.id}/endpoints/${endpoint.id}`}>
                            <Button variant="outline">
                                View Endpoint
                            </Button>
                        </Link>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table> : <NoEndpointsData service={service} />}</div>)
}
