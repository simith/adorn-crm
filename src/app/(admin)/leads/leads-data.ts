export type LeadRow = {
    id: string;
    customer: string;
    email: string;
    joinedOn: string;
    lastVisited: string;
    totalSpend: string;
    city: string;
};

export const LEADS_TABLE_DATA: LeadRow[] = [
    { id: "1", customer: "Aisha Sharma", email: "aisha.sharma@email.com", joinedOn: "Jan 05, 2024", lastVisited: "Apr 23, 2024", totalSpend: "₹1,24,500", city: "Udupi" },
    { id: "2", customer: "Rahul Verma", email: "rahul.verma@email.com", joinedOn: "Feb 12, 2024", lastVisited: "May 01, 2024", totalSpend: "₹89,200", city: "Mangaluru" },
    { id: "3", customer: "Priya Patel", email: "priya.patel@email.com", joinedOn: "Mar 08, 2024", lastVisited: "Apr 28, 2024", totalSpend: "₹2,15,000", city: "Shivamogga" },
    { id: "4", customer: "Vikram Singh", email: "vikram.singh@email.com", joinedOn: "Jan 18, 2024", lastVisited: "May 05, 2024", totalSpend: "₹56,700", city: "Kundapura" },
    { id: "5", customer: "Ananya Reddy", email: "ananya.reddy@email.com", joinedOn: "Apr 02, 2024", lastVisited: "Apr 30, 2024", totalSpend: "₹1,78,400", city: "Kumta" },
    { id: "6", customer: "Arjun Nair", email: "arjun.nair@email.com", joinedOn: "Feb 25, 2024", lastVisited: "May 02, 2024", totalSpend: "₹94,300", city: "Panaji" },
    { id: "7", customer: "Sneha Iyer", email: "sneha.iyer@email.com", joinedOn: "Mar 14, 2024", lastVisited: "Apr 25, 2024", totalSpend: "₹1,42,800", city: "Sagara" },
    { id: "8", customer: "Karan Mehta", email: "karan.mehta@email.com", joinedOn: "Jan 30, 2024", lastVisited: "May 04, 2024", totalSpend: "₹67,900", city: "Chikkamagaluru" },
    { id: "9", customer: "Divya Krishnan", email: "divya.k@email.com", joinedOn: "Apr 10, 2024", lastVisited: "Apr 22, 2024", totalSpend: "₹2,01,500", city: "Hebri" },
    { id: "10", customer: "Rohan Desai", email: "rohan.desai@email.com", joinedOn: "Feb 05, 2024", lastVisited: "Apr 29, 2024", totalSpend: "₹1,35,200", city: "Karkala" },
    { id: "11", customer: "Neha Gupta", email: "neha.gupta@email.com", joinedOn: "Mar 22, 2024", lastVisited: "May 03, 2024", totalSpend: "₹78,600", city: "Belthangady" },
];

export const LEADS_STATS = {
    totalLeads: 12,
    totalSpend: "₹10,49,500",
};
