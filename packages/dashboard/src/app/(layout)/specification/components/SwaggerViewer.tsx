"use client"
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

type Props = {
    //eslint-disable-next-line
    spec: any
}

const ApiDocs = ({spec}:Props) => {


    return <SwaggerUI
        spec={spec}
        tryItOutEnabled={true}
        supportedSubmitMethods={['get', 'post', 'put', 'delete']}
        requestSnippetsEnabled={true}
        displayOperationId={false}
        docExpansion="list"
        defaultModelRendering="example"
        showMutatedRequest={true}
    />;
};

export default ApiDocs;
