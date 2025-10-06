import React from 'react'

const LoaderSpinner = () => {
    return (
        <div>
            <div className="loader-spinner">
                <div className="spinner"></div>
                <style jsx>{`
                    .loader-spinner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100px;
                    }
                    .spinner {
                        border: 4px solid rgba(0, 0, 0, 0.1);
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border-left-color: #09f;
                        animation: spin 1s ease infinite;
                    }
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default LoaderSpinner