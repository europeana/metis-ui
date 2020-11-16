/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for api facet name
*/
import { Pipe, PipeTransform } from '@angular/core';

const apiFacetNames: { [key: string]: string } = {
  contentTier: 'Content Tier',
  metadataTier: 'Metadata Tier',
  COUNTRY: 'Country',
  LANGUAGE: 'Language',
  TYPE: 'Type',
  RIGHTS: 'Rights',
  DATA_PROVIDER: 'Data Provider',
  PROVIDER: 'Provider',
  '1 OR 2 OR 3 OR 4': '> 0'
};

@Pipe({
  name: 'renameApiFacet'
})
export class RenameApiFacetPipe implements PipeTransform {
  transform(value: string): string {
    const res = apiFacetNames[value];
    return res ? res : value;
  }
}
