import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import './i18n'
import App from './App'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60_000,
            gcTime: 10 * 60_000,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <ToastContainer
                position="bottom-left"
                autoClose={4000}
                rtl={true}
                theme="light"
                toastStyle={{
                    fontFamily: 'inherit',
                    direction: 'rtl',
                }}
            />
        </QueryClientProvider>
    </React.StrictMode>,
)
