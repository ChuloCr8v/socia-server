// src/utils/formatOrderEmailContext.ts

import { OrderStatus, OrderRejectionReason } from '@prisma/client';

type OrderItem = {
    name: string;
    quantity: number;
    total: number;
};

interface FormatOrderEmailContextParams {
    orderId: string;
    customerName: string;
    orderStatus: OrderStatus;
    rejectionReason?: OrderRejectionReason | string | null;
    rejectionNote?: string | null;
    eta?: string | null;
    items: OrderItem[];
    totalAmount: number;
    actionUrl?: string;
    to: string;
    status: OrderStatus
}

export function formatOrderEmailContext({
    orderId,
    customerName,
    orderStatus,
    rejectionReason,
    rejectionNote,
    eta,
    items,
    totalAmount,
    actionUrl,
    to,
    status
}: FormatOrderEmailContextParams) {
    const statusLabels = {
        PLACED: 'Order Placed',
        CONFIRMED: 'Order Confirmed',
        PREPARING: 'Preparing',
        READY: 'Ready for Pickup',
        PICKED_UP: 'Picked Up',
        ON_THE_WAY: 'On The Way',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
        PENDING: 'Pending',
        RECEIVED: 'Received',
        REJECTED: 'Rejected',
    };

    const rejectionReasons = {
        OUT_OF_STOCK: 'Out of Stock',
        TEMP_UNAVAILABLE: 'Temporarily Unavailable',
        CLOSED: 'Closed for the Day',
        NONE: 'No Reason Provided',
        OTHERS: 'Other Reason',
    };

    const formattedStatus = statusLabels[orderStatus] || orderStatus;
    const formattedRejectionReason =
        rejectionReason && rejectionReasons[rejectionReason as keyof typeof rejectionReasons]
            ? rejectionReasons[rejectionReason as keyof typeof rejectionReasons]
            : rejectionReason;

    return {
        to,
        orderId,
        customerName,
        orderStatus,
        status,
        formattedStatus,
        rejectionReason: formattedRejectionReason,
        rejectionNote,
        eta,
        items,
        totalAmount,
        actionUrl: actionUrl ?? `uorder-customer://orders/${orderId}`,
        year: new Date().getFullYear(),
    };
}
