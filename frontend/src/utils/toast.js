export function showToast(message, type = "success") {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent("toast:show", {
            detail: {
                message,
                type,
            },
        })
    );
}
