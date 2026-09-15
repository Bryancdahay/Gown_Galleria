import { useEffect, useState } from "react";
import { testApi } from "../api";

function ApiStatus() {
    const [apiStatus, setApiStatus] = useState("Checking API...");
    const [apiData, setApiData] = useState(null);

    useEffect(() => {
        testApi()
            .then((data) => {
                setApiData(data);
                setApiStatus("Connected");
            })
            .catch(() => {
                setApiStatus("Connection failed");
            });
    }, []);

    const statusColor =
        apiStatus === "Connected"
            ? "bg-green-500"
            : apiStatus === "Connection failed"
              ? "bg-red-500"
              : "bg-yellow-500";

    return (
        <div className="mx-auto mt-16 max-w-xl rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
                Backend Connection
            </h2>

            <div className="mt-4 flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${statusColor}`} />

                <span className="text-gray-700">
                    {apiStatus}
                </span>
            </div>

            {apiData && (
                <pre className="mt-4 overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
                    {JSON.stringify(apiData, null, 2)}
                </pre>
            )}
        </div>
    );
}

export default ApiStatus;
