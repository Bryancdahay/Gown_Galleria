import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    approveShopApplication,
    convertToShopOwner,
    declineShopApplication,
    getNotificationsForUser,
    getShopApplications,
    markAllNotificationsRead,
} from "../data/catalog";
import { showToast } from "../utils/toast";

function NotificationsPage() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const [notifications, setNotifications] = useState(() =>
        getNotificationsForUser(currentUser)
    );
    const [applications, setApplications] = useState(() => getShopApplications());

    useEffect(() => {
        function syncNotifications() {
            setNotifications(getNotificationsForUser(currentUser));
            setApplications(getShopApplications());
        }

        syncNotifications();
        markAllNotificationsRead(currentUser);

        window.addEventListener("notifications:updated", syncNotifications);
        window.addEventListener("shop-applications:updated", syncNotifications);
        return () => {
            window.removeEventListener("notifications:updated", syncNotifications);
            window.removeEventListener("shop-applications:updated", syncNotifications);
        };
    }, []);

    function handleApprove(notification) {
        approveShopApplication(notification.applicationId);
        setNotifications(getNotificationsForUser(currentUser));
        setApplications(getShopApplications());
        showToast("Application approved.");
    }

    function handleDecline(notification) {
        declineShopApplication(notification.applicationId);
        setNotifications(getNotificationsForUser(currentUser));
        setApplications(getShopApplications());
        showToast("Application declined.");
    }

    function handleBecomeShopOwner(notification) {
        const updatedUser = convertToShopOwner(notification.applicationId);

        if (!updatedUser) {
            showToast("Unable to activate your shop account. Please try again.", "error");
            return;
        }

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user:updated"));
        showToast("Your shop account is now live!");
        navigate("/admin/dashboard");
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">Updates about your account and shop applications.</p>

            <div className="mt-8 space-y-3">
                {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                        No notifications yet.
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const application = applications.find(
                            (app) => app.id === notification.applicationId
                        );
                        const isDecided = application && application.status !== "pending";

                        return (
                            <div
                                key={notification.id}
                                className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm"
                            >
                                <p className="text-gray-900">{notification.message}</p>
                                <time className="mt-1 block text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </time>

                                {notification.type === "shop-application-new" && (
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(notification)}
                                            disabled={isDecided}
                                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                                                isDecided
                                                    ? "cursor-not-allowed bg-green-300"
                                                    : "bg-green-600 hover:bg-green-700"
                                            }`}
                                        >
                                            {application?.status === "approved" ? "Approved" : "Approve"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDecline(notification)}
                                            disabled={isDecided}
                                            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                                isDecided
                                                    ? "cursor-not-allowed bg-red-50/50 text-red-300"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                            }`}
                                        >
                                            {application?.status === "declined" ? "Declined" : "Decline"}
                                        </button>
                                    </div>
                                )}

                                {notification.type === "shop-application-approved" && (
                                    <button
                                        type="button"
                                        onClick={() => handleBecomeShopOwner(notification)}
                                        disabled={application?.converted}
                                        className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                                            application?.converted
                                                ? "cursor-not-allowed bg-green-300"
                                                : "bg-green-600 hover:bg-green-700"
                                        }`}
                                    >
                                        {application?.converted ? "Shop owner activated" : "Be a shop owner"}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default NotificationsPage;
