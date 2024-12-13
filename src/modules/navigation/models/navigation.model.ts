export interface RouteData {
    title?: string;
    activeTopNav?: string;
    breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
    text: string;
    link?: string;
    active?: boolean;
}

export interface SideNavItems {
    [index: string]: SideNavItem  | null;
}

export interface SideNavItem {
    icon?: string | null;
    text: string;
    link?: string | null;
    rid?: string | null;
    pkid?: number | null;
    submenu?: SideNavItem[] | null;
    new?: boolean | null;
    updated?: boolean | null;
    roles?: string[] | null;
    params?: any | null;
    ordem?: number | null;
    isLoading?: boolean | null;
}

export interface SideNavSection {
    text?: string  | null;
    items: string[]  | null;
    roles?: string[] | null;
}

