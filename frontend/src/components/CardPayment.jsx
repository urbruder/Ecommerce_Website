import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CardForm = forwardRef(({ selected, onSelect }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const [complete, setComplete] = useState(false);
    const [cardError, setCardError] = useState('');

    useImperativeHandle(ref, () => ({
        confirm: async (clientSecret, billingDetails) => {
            if (!stripe || !elements) {
                throw new Error("Stripe has not initialized yet. Please try again.");
            }
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error("Card element not found.");
            }
            return await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: billingDetails,
                },
            });
        },
        isComplete: () => complete,
    }));

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '14px',
                color: '#374151',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                '::placeholder': {
                    color: '#9CA3AF',
                },
            },
            invalid: {
                color: '#EF4444',
            },
        },
        hidePostalCode: true,
    };

    return (
        <div
            className={`border rounded p-4 transition-all duration-200 ${
                selected ? 'border-gray-400 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50 opacity-60'
            }`}
        >
            {/* Header row styled like other payment method options */}
            <div
                onClick={() => {
                    if (onSelect) onSelect();
                }}
                className='flex items-center justify-between cursor-pointer'
            >
                <div className='flex items-center gap-3'>
                    <p
                        className={`min-w-3.5 h-3.5 border rounded-full transition-colors ${
                            selected ? 'bg-green-400 border-green-500' : 'border-gray-400'
                        }`}
                    ></p>
                    <p className='text-gray-700 text-sm font-medium'>CREDIT / DEBIT CARD</p>
                </div>
                {!selected && (
                    <span className='text-xs text-gray-400 italic'>
                        Select this to pay by card
                    </span>
                )}
            </div>

            {/* Persistent CardElement container */}
            <div className='mt-3'>
                <div
                    className={`p-3 border rounded transition-colors ${
                        selected ? 'bg-white border-gray-300' : 'bg-gray-100/70 border-gray-200'
                    }`}
                >
                    <CardElement
                        options={cardElementOptions}
                        onFocus={() => {
                            if (!selected && onSelect) onSelect();
                        }}
                        onChange={(event) => {
                            setComplete(event.complete);
                            setCardError(event.error ? event.error.message : '');
                        }}
                    />
                </div>

                {/* Inline error line from CardElement onChange */}
                {selected && cardError && (
                    <p className='text-xs text-red-500 mt-1.5'>{cardError}</p>
                )}

                {/* Secured by Stripe note */}
                {selected && (
                    <p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
                        🔒 Secured by Stripe. Card details are encrypted end-to-end.
                    </p>
                )}
            </div>
        </div>
    );
});

CardForm.displayName = 'CardForm';

const CardPayment = forwardRef(({ active, selected, onSelect }, ref) => {
    if (!stripePromise) {
        return (
            <div className='border border-gray-200 rounded p-4 bg-gray-50 opacity-60'>
                <div className='flex items-center gap-3'>
                    <p className='min-w-3.5 h-3.5 border border-gray-300 rounded-full'></p>
                    <p className='text-gray-400 text-sm font-medium'>CREDIT / DEBIT CARD</p>
                </div>
                <p className='text-xs text-amber-600 mt-2'>
                    Card payments are unavailable right now.
                </p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <CardForm
                ref={ref}
                active={active}
                selected={selected}
                onSelect={onSelect}
            />
        </Elements>
    );
});

CardPayment.displayName = 'CardPayment';

export default CardPayment;
