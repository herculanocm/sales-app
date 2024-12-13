import { Organization } from "@modules/access/access.utils";

export interface GroupUser {
    id: number;
    name: string;
    description: string;
    enableState: boolean;
    userInclusion: string;
    userLastUpdate: string;
    dtaInclusion: Date;
    dtaLastUpdate: Date;
    organization: Organization;
}
export interface PbiWorkspaceDTO {
    id: string;
    isReadOnly: boolean;
    isOnDedicatedCapacity: boolean;
    capacityId: string;
    defaultDatasetStorageFormat: string;
    name: string;
    dataflowStorageId: string;
}
export interface PbiWorkspaceContentDTO {
    value: PbiWorkspaceDTO[];
}
export interface PbiReportDTO {
    id: string;
    reportType: string;
    name: string;
    webUrl: string;
    embedUrl: string;
    isFromPbix: boolean;
    isOwnedByMe: boolean;
    datasetId: string;
    datasetWorkspaceId: string;
}
export interface PbiReportContentDTO {
    value: PbiReportDTO[];
}
export interface SubMenuReport {
    pkid: number | null;
    text: string;
    id: string | null;
    reportType: string | null;
    name: string | null;
    orderView: number | null;
    webUrl: string | null;
    embedUrl: string | null;
    isFromPbix: boolean | null;
    isOwnedByMe: boolean | null;
    datasetId: string | null;
    datasetWorkspaceId: string | null;
    userInclusion: string | null;
    userLastUpdate: string | null;
    dtaInclusion: Date | null;
    dtaLastUpdate: Date | null;
    workspace: PbiWorkspaceDTO | null;
    groupUsers: GroupUser[] | null;
}
export interface MenuReport {
    id: number;
    icon: string;
    text: string;
    orderView: number;
    groupUsers: GroupUser[];
    enableState: boolean;
    organization: Organization;
    userInclusion: string | null;
    userLastUpdate: string | null;
    dtaInclusion: Date | null;
    dtaLastUpdate: Date | null;
    subMenuReports: SubMenuReport[];
}
