import {Skeleton} from "../../../components/ui/skeleton"
import {Card, CardHeader} from "../../../components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../../components/ui/tabs"
import {Grid2x2, TableOfContents} from "lucide-react"
import {ServicePageHeader} from "./components/PageHeader";

export default function Loading() {
    return (
        <div className="container mx-auto">
            <ServicePageHeader isLoading/>
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <Card
                                key={index}
                                className="transition-all duration-100 ease-in-out transform hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                            >
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-5 w-5 rounded"/>
                                        <Skeleton className="h-5 w-32"/>
                                    </div>
                                    <Skeleton className="h-4 w-full mt-2"/>
                                    <Skeleton className="h-4 w-3/4 mt-2"/>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="table">
                    <Table>
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
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8 rounded"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-40"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-32"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-9 w-28"/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>

            </Tabs>
        </div>
    )
}

