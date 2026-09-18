/** SearchResultsComponent
/* - component for viewing search results
/* - subscribes to ActivatedRoute instance for live query / result data
*/
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { DatasetSearchView } from '../_models';
import { DatasetsService, DocumentTitleService } from '../_services';
import { TranslatePipe } from '../_translate/translate.pipe';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  imports: [RouterLink, NgTemplateOutlet, DatePipe, TranslatePipe]
})
export class SearchResultsComponent implements OnInit {
  private readonly documentTitleService = inject(DocumentTitleService);
  private readonly datasets = inject(DatasetsService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  searchString = signal<string>('');
  currentPage = signal<number>(0);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(false);
  results = signal<DatasetSearchView[]>([]);

  query = computed(() => {
    const currentSearch = this.searchString();
    return currentSearch ? decodeURIComponent(currentSearch) : '';
  });

  /** ngOnInit
  /* - URI-decode the query parameter
  /* - set the query variable
  /* - set the document title
  /*  - includes the query variable if available
  */
  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (params) => {
        this.searchString.set(params.searchString || '');
        this.load();
        this.documentTitleService.setTitle(
          ['Search Results', this.searchString()].filter(Boolean).join(' | ')
        );
      }
    });
  }

  /** loadNextPage
  /* - increment the page tracking variable
  /* - call load function
  */
  loadNextPage(): void {
    this.currentPage.update((page) => page + 1);
    this.load();
  }

  /** load
  /* - do nothing if there is no searchString variable set
  /* - sets the query variable to the decoded searchString variable
  /* - manages isLoading and hasMore variables
  /* - invokes dataset search service
  /* - assigns result to results variable
  */
  load(): void {
    const currentSearch = this.searchString();

    if (currentSearch) {
      this.isLoading.set(true);

      this.datasets
        .getSearchResultsUptoPage(currentSearch, this.currentPage())
        .pipe(take(1))
        .subscribe({
          next: ({ results, more }) => {
            this.results.set(results);
            this.isLoading.set(false);
            this.hasMore.set(more);
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading.set(false);
            console.log(err);
          }
        });
    } else {
      this.results.set([]);
      this.searchString.set('');
      this.hasMore.set(false);
    }
  }
}
