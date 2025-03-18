import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export async function* retry(
    axiosConfig: AxiosRequestConfig,
    count: number,
    interval_s: number,
): AsyncGenerator<{
    response: AxiosResponse | AxiosError;
    retryNumber: number;
}> {
    let retryNumber = 0;
    do {
        try {
            yield { response: await axios(axiosConfig), retryNumber };
            break;
        } catch (error: any) {
            if (interval_s > 0) {
                await new Promise((resolve) =>
                    setTimeout(resolve, interval_s * 1000),
                );
            }
            yield { response: error, retryNumber };
        } finally {
            retryNumber++;
        }
    } while (retryNumber < count);
}
