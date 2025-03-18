import {createClient} from "@/utils/supabase/server";
import {Button} from "@/components/ui/button"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import Link from "next/link";
import {Grid2x2, TableOfContents} from "lucide-react";
import {ColorSquare} from "@/components/ColorSquare";
import {ServicePageHeader} from "@/app/(layout)/services/components/PageHeader";
import {NoServicesData} from "@/app/(layout)/services/components/NoServicesData";


export default async function PrivatePage() {
    const supabase = await createClient()
    const {data: user} = await supabase.auth.getUser()
    const {data: services} = await supabase
        .from('services')
        .select()
        .eq('user_id', user?.user?.id as string)
        .order('updated_at', {ascending: false})

    return <div className="container mx-auto">
        <ServicePageHeader/>
        <Tabs defaultValue="cards" className="w-full">
            <TabsList className="mb-4">
                <TabsTrigger value="cards">
                    <Grid2x2 className="mr-1 h-4 w-4"/>
                    Cards</TabsTrigger>
                <TabsTrigger value="table">
                    <TableOfContents className="mr-1 h-4 w-4"/>
                    Table
                </TabsTrigger>
            </TabsList>
            <TabsContent value="cards">
                {!services?.length && <NoServicesData/>}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services?.map((service) => (
                        <Link href={`/services/${service.id}`} key={service.id}>
                            <Card
                                className="transition-all duration-100 ease-in-out transform hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <ColorSquare name={service.name}/>
                                        <CardTitle>{service.name}</CardTitle>
                                    </div>
                                    <CardDescription className="truncate">{service.description}</CardDescription>
                                    <p className="text-sm">{service.base_url}</p>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="table">
                {!services?.length && <NoServicesData/>}
                {!!services?.length && <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Base URL</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services?.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>
                                    <ColorSquare name={service.name}/>
                                </TableCell>
                                <TableCell>{service.name}</TableCell>
                                <TableCell>{service.description}</TableCell>
                                <TableCell>{service.base_url}</TableCell>
                                <TableCell>
                                    <Button asChild variant="outline">
                                        <Link href={`/services/${service.id}`}>View service</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>}
            </TabsContent>
        </Tabs>
    </div>
}
