import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { mockOrders } from '../data/mockData';

import type { Order, OrderStatus } from '../types/order';
import type { Customer } from '../types/customer';
import type { Driver } from '../types/driver';
import type { Invoice } from '../types/invoice';
import type { Shipment } from '../types/shipment';
import type { Vehicle } from '../types/vehicle';
import type { Warehouse } from '../types/warehouse';

interface DataContextType {
    // Orders
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    updateOrderStatus: (id: string | number, status: OrderStatus) => void;
    cancelOrder: (id: string | number) => void;

    // Customers
    customers: Customer[];
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;

    // Drivers
    drivers: Driver[];
    addDriver: (driver: Driver) => void;
    updateDriver: (driver: Driver) => void;
    deleteDriver: (id: string) => void;

    // Vehicles
    vehicles: Vehicle[];
    addVehicle: (vehicle: Vehicle) => void;
    updateVehicle: (vehicle: Vehicle) => void;
    deleteVehicle: (id: string) => void;

    // Shipments
    shipments: Shipment[];
    addShipment: (shipment: Shipment) => void;
    updateShipment: (shipment: Shipment) => void;
    deleteShipment: (id: string) => void;

    // Warehouses
    warehouses: Warehouse[];
    addWarehouse: (warehouse: Warehouse) => void;
    updateWarehouse: (warehouse: Warehouse) => void;
    deleteWarehouse: (id: string) => void;

    // Invoices
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (invoice: Invoice) => void;
    deleteInvoice: (id: string) => void;

    // Reset demo data
    resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/* -------------------------------------------------------
   Safe localStorage reader
------------------------------------------------------- */

function getStoredData<T>(key: string, fallback: T): T {
    try {
        const stored = localStorage.getItem(key);

        if (!stored) {
            return fallback;
        }

        return JSON.parse(stored) as T;
    } catch (error) {
        console.warn(`Unable to read ${key} from localStorage`, error);
        return fallback;
    }
}

/* -------------------------------------------------------
   Provider
------------------------------------------------------- */

export function DataProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    /*
     * ORDERS
     */

    const [orders, setOrders] = useState<Order[]>(() =>
        getStoredData<Order[]>('primeroute_orders', mockOrders)
    );

    /*
     * OTHER DATA
     *
     * These will automatically use existing mock data
     * if those arrays exist in mockData.ts.
     *
     * We start with empty arrays so the project does
     * not break if a particular mock collection doesn't exist.
     */

    const [customers, setCustomers] = useState<Customer[]>(() =>
        getStoredData<Customer[]>('primeroute_customers', [])
    );

    const [drivers, setDrivers] = useState<Driver[]>(() =>
        getStoredData<Driver[]>('primeroute_drivers', [])
    );

    const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
        getStoredData<Vehicle[]>('primeroute_vehicles', [])
    );

    const [shipments, setShipments] = useState<Shipment[]>(() =>
        getStoredData<Shipment[]>('primeroute_shipments', [])
    );

    const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
        getStoredData<Warehouse[]>('primeroute_warehouses', [])
    );

    const [invoices, setInvoices] = useState<Invoice[]>(() =>
        getStoredData<Invoice[]>('primeroute_invoices', [])
    );

    /* -------------------------------------------------------
       Persist data whenever it changes
    ------------------------------------------------------- */

    useEffect(() => {
        localStorage.setItem(
            'primeroute_orders',
            JSON.stringify(orders)
        );
    }, [orders]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_customers',
            JSON.stringify(customers)
        );
    }, [customers]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_drivers',
            JSON.stringify(drivers)
        );
    }, [drivers]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_vehicles',
            JSON.stringify(vehicles)
        );
    }, [vehicles]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_shipments',
            JSON.stringify(shipments)
        );
    }, [shipments]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_warehouses',
            JSON.stringify(warehouses)
        );
    }, [warehouses]);

    useEffect(() => {
        localStorage.setItem(
            'primeroute_invoices',
            JSON.stringify(invoices)
        );
    }, [invoices]);

    /* -------------------------------------------------------
       ORDER CRUD
    ------------------------------------------------------- */

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    const updateOrder = (updatedOrder: Order) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === updatedOrder.id
                    ? updatedOrder
                    : order
            )
        );
    };

    const updateOrderStatus = (
        id: string | number,
        status: OrderStatus
    ) => {
        setOrders((prev) =>
            prev.map((order) =>
                String(order.id) === String(id)
                    ? { ...order, status }
                    : order
            )
        );
    };

    const cancelOrder = (id: string | number) => {
        setOrders((prev) =>
            prev.map((order) =>
                String(order.id) === String(id)
                    ? { ...order, status: 'CANCELLED' }
                    : order
            )
        );
    };

    /* -------------------------------------------------------
       CUSTOMER CRUD
    ------------------------------------------------------- */

    const addCustomer = (customer: Customer) => {
        setCustomers((prev) => [customer, ...prev]);
    };

    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers((prev) =>
            prev.map((customer) =>
                customer.id === updatedCustomer.id
                    ? updatedCustomer
                    : customer
            )
        );
    };

    const deleteCustomer = (id: string) => {
        setCustomers((prev) =>
            prev.filter((customer) => customer.id !== id)
        );
    };

    /* -------------------------------------------------------
       DRIVER CRUD
    ------------------------------------------------------- */

    const addDriver = (driver: Driver) => {
        setDrivers((prev) => [driver, ...prev]);
    };

    const updateDriver = (updatedDriver: Driver) => {
        setDrivers((prev) =>
            prev.map((driver) =>
                driver.id === updatedDriver.id
                    ? updatedDriver
                    : driver
            )
        );
    };

    const deleteDriver = (id: string) => {
        setDrivers((prev) =>
            prev.filter((driver) => driver.id !== id)
        );
    };

    /* -------------------------------------------------------
       VEHICLE CRUD
    ------------------------------------------------------- */

    const addVehicle = (vehicle: Vehicle) => {
        setVehicles((prev) => [vehicle, ...prev]);
    };

    const updateVehicle = (updatedVehicle: Vehicle) => {
        setVehicles((prev) =>
            prev.map((vehicle) =>
                vehicle.id === updatedVehicle.id
                    ? updatedVehicle
                    : vehicle
            )
        );
    };

    const deleteVehicle = (id: string) => {
        setVehicles((prev) =>
            prev.filter((vehicle) => vehicle.id !== id)
        );
    };

    /* -------------------------------------------------------
       SHIPMENT CRUD
    ------------------------------------------------------- */

    const addShipment = (shipment: Shipment) => {
        setShipments((prev) => [shipment, ...prev]);
    };

    const updateShipment = (updatedShipment: Shipment) => {
        setShipments((prev) =>
            prev.map((shipment) =>
                shipment.id === updatedShipment.id
                    ? updatedShipment
                    : shipment
            )
        );
    };

    const deleteShipment = (id: string) => {
        setShipments((prev) =>
            prev.filter((shipment) => shipment.id !== id)
        );
    };

    /* -------------------------------------------------------
       WAREHOUSE CRUD
    ------------------------------------------------------- */

    const addWarehouse = (warehouse: Warehouse) => {
        setWarehouses((prev) => [warehouse, ...prev]);
    };

    const updateWarehouse = (updatedWarehouse: Warehouse) => {
        setWarehouses((prev) =>
            prev.map((warehouse) =>
                warehouse.id === updatedWarehouse.id
                    ? updatedWarehouse
                    : warehouse
            )
        );
    };

    const deleteWarehouse = (id: string) => {
        setWarehouses((prev) =>
            prev.filter((warehouse) => warehouse.id !== id)
        );
    };

    /* -------------------------------------------------------
       INVOICE CRUD
    ------------------------------------------------------- */

    const addInvoice = (invoice: Invoice) => {
        setInvoices((prev) => [invoice, ...prev]);
    };

    const updateInvoice = (updatedInvoice: Invoice) => {
        setInvoices((prev) =>
            prev.map((invoice) =>
                invoice.id === updatedInvoice.id
                    ? updatedInvoice
                    : invoice
            )
        );
    };

    const deleteInvoice = (id: string) => {
        setInvoices((prev) =>
            prev.filter((invoice) => invoice.id !== id)
        );
    };

    /* -------------------------------------------------------
       RESET DEMO DATA
    ------------------------------------------------------- */

    const resetAllData = () => {
        localStorage.removeItem('primeroute_orders');
        localStorage.removeItem('primeroute_customers');
        localStorage.removeItem('primeroute_drivers');
        localStorage.removeItem('primeroute_vehicles');
        localStorage.removeItem('primeroute_shipments');
        localStorage.removeItem('primeroute_warehouses');
        localStorage.removeItem('primeroute_invoices');

        window.location.reload();
    };

    return (
        <DataContext.Provider
            value={{
                orders,
                addOrder,
                updateOrder,
                updateOrderStatus,
                cancelOrder,

                customers,
                addCustomer,
                updateCustomer,
                deleteCustomer,

                drivers,
                addDriver,
                updateDriver,
                deleteDriver,

                vehicles,
                addVehicle,
                updateVehicle,
                deleteVehicle,

                shipments,
                addShipment,
                updateShipment,
                deleteShipment,

                warehouses,
                addWarehouse,
                updateWarehouse,
                deleteWarehouse,

                invoices,
                addInvoice,
                updateInvoice,
                deleteInvoice,

                resetAllData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

/* -------------------------------------------------------
   Hook
------------------------------------------------------- */

export function useData() {
    const context = useContext(DataContext);

    if (!context) {
        throw new Error(
            'useData must be used inside a DataProvider'
        );
    }

    return context;
}