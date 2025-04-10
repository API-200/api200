
export default function SchemaTab({ schema }: { schema: JSON }) {
    return (
        <div className="overflow-hidden rounded-md border border-gray-300">
            <pre className="p-4 text-sm overflow-x-auto bg-gray-50">
                <code>{schema ? JSON.stringify(schema, null, 2) : "Schema not determined yet"}</code>
            </pre>
        </div>
    )
}