function LoadingModal({ isOpen, message = "Processing..." }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay z-10000 bg-gray-900/60">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
                <h3 className="text-lg font-bold text-gray-900">Please wait</h3>
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>
        </div>
    );
}

export default LoadingModal;
