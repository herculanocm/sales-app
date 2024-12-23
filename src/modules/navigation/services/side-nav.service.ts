import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UtilityService } from './utility.service';
import * as CryptoJS from 'crypto-js';

const _expand$ = new Subject<string[]>();

export interface ExpandedTable {
    [index: string]: boolean;
}

const EXPANDED_TABLE_CACHE_NAME = 'sbpro-expanded-table';

@Injectable()
export class SideNavService {
    expandedTable: ExpandedTable = {};

    constructor(private utilityService: UtilityService) {
        const cachedExpandedTable = this.utilityService.getStoredObject<ExpandedTable>(
            EXPANDED_TABLE_CACHE_NAME
        );
        if (cachedExpandedTable) {
            this.expandedTable = cachedExpandedTable;
        }
    }

    get expand$(): any {
        return _expand$;
    }

    isExpanded(hash: string): boolean {
        if (this.expandedTable[hash]) {
            return true;
        }
        return false;
    }

    setExpanded(hash: string, expanded: boolean) {
        this.expandedTable[hash] = expanded;
    }

    setDefault(hierarchyExtension: string[]) {
        if (
            Object.keys(this.expandedTable).length === 0 &&
            this.expandedTable.constructor === Object
        ) {
            this.saveCache(hierarchyExtension, '/dashboard');
        }
    }

    saveCache(hierarchyExtension: string[], link: string) {
        if (!link.match(/^\/dashboard/)) {
            return;
        }
        this.expandedTable = {};
        hierarchyExtension.forEach((id) => (this.expandedTable[id] = true));
        this.utilityService.storeObject(EXPANDED_TABLE_CACHE_NAME, this.expandedTable);
    }

    hashObject(jsonObject: any): string {
        // Convert the JSON object to a string
        const jsonString = JSON.stringify(jsonObject);
    
        // Use SHA256 algorithm for hashing
        const hash = CryptoJS.SHA256(jsonString);
    
        // Convert the hash to a hexadecimal string
        const hashString = hash.toString(CryptoJS.enc.Hex);
    
        return hashString;
      }
}
