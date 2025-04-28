
// This is a fallback config in the event that the module json config is not found in the DOM.
/* eslint-disable camelcase */
const DEFAULT_MODULE_CONFIG = Object.freeze({
  autosuggest_results_message: 'Results for “[[search_term]]”',
  sr_autosuggest_results_message:
    'There are currently [[number_of_results]] auto-suggested results for [[search_term]].',
  sr_search_field_aria_label:
    'This is a search field with an auto-suggest feature attached.',
  sr_search_button_aria_label: 'Search',
});
/* eslint-enable camelcase */

const SEARCH_URL_BASE = '/_hcms/v3/site-search/search';

// Add a variable so we can clear the autosuggest announcement timeout if the user keeps typing.
let srAnnounceTimeout;

/**
 * Grab JSON configuration for the module from the HubL data.
 */

const getModuleConfig = moduleName => {
  const configJSONScript = document.querySelector(
    `[data-${moduleName}-config]`
  );
  if (configJSONScript) {
    return JSON.parse(configJSONScript.textContent);
  }
  return DEFAULT_MODULE_CONFIG;
};

const moduleConfig = getModuleConfig('search_input');

const TYPEAHEAD_LIMIT = 3;
const KEYS = Object.freeze({
  TAB: 'Tab',
  ESC: 'Esc', // IE11 & Edge 16 value for Escape
  ESCAPE: 'Escape',
  UP: 'Up', // IE11 & Edge 16 value for Arrow Up
  ARROW_UP: 'ArrowUp',
  DOWN: 'Down', // IE11 & Edge 16 value for Arrow Down
  ARROW_DOWN: 'ArrowDown',
});

const debounce = (func, wait) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

const emptySearchSuggestions = (suggestionsResponse, searchInputElements) => {
  const {
    searchForm,
    searchSuggestions,
    searchInput,
    srMessageContainer,
  } = searchInputElements;

  const { searchTerm } = suggestionsResponse;

  const noSearchResultsMessage = searchTerm
    ? moduleConfig.autosuggest_no_results_message.replace(
        '[[search_term]]',
        searchTerm
      )
    : moduleConfig.sr_empty_search_field_message;

  const emptyResultsItem = `<li role="option"
    tabindex="-1"
    aria-posinset="1"
    aria-setsize="0"
    class="results-for ${
      !searchTerm ? 'show-for-sr' : ''
    }">${noSearchResultsMessage}</li>`;

  searchSuggestions.innerHTML = emptyResultsItem;

  srMessageContainer.innerHTML = noSearchResultsMessage;

  searchInput.focus();
  searchForm.classList.remove('hs-search-field--open');
};

const trapFocus = searchInputElements => {
  const {
    searchInput,
    searchSuggestions,
    searchInputContainer,
  } = searchInputElements;

  const tabbable = [];
  tabbable.push(searchInput);

  const suggestions = searchSuggestions.querySelectorAll('a');

  suggestions.forEach(suggestion => tabbable.push(suggestion));

  const firstTabbable = tabbable[0];
  const lastTabbable = tabbable[tabbable.length - 1];

  const tabResult = e => {
    if (e.target === lastTabbable && !e.shiftKey) {
      e.preventDefault();
      firstTabbable.focus();
    } else if (e.target === firstTabbable && e.shiftKey) {
      e.preventDefault();
      lastTabbable.focus();
    }
  };

  const nextResult = e => {
    e.preventDefault();
    if (e.target === lastTabbable) {
      firstTabbable.focus();
    } else {
      tabbable.forEach(el => {
        if (el === e.target) {
          tabbable[tabbable.indexOf(el) + 1].focus();
        }
      });
    }
  };

  const previousResult = e => {
    e.preventDefault();
    if (e.target === firstTabbable) {
      lastTabbable.focus();
    } else {
      tabbable.forEach(el => {
        if (el === e.target) {
          tabbable[tabbable.indexOf(el) - 1].focus();
        }
      });
    }
  };

  searchInputContainer.removeEventListener('keydown', window.captureKeyDown);

  window.captureKeyDown = e => {
    switch (e.key) {
      case KEYS.TAB:
        tabResult(e);
        break;
      case KEYS.ESC:
      case KEYS.ESCAPE:
        emptySearchSuggestions({}, searchInputElements);
        break;
      case KEYS.UP:
      case KEYS.ARROW_UP:
        previousResult(e);
        break;
      case KEYS.DOWN:
      case KEYS.ARROW_DOWN:
        nextResult(e);
        break;
      default:
        break;
    }
  };

  searchInputContainer.addEventListener('keydown', window.captureKeyDown);
};

const announceSearchSuggestions = (suggestionsResponse, srMessageContainer) => {
  const { results, searchTerm } = suggestionsResponse;
  if (srMessageContainer) {
    srMessageContainer.innerHTML = `${moduleConfig.sr_autosuggest_results_message
      .replace('[[number_of_results]]', results.length)
      .replace('[[search_term]]', searchTerm)}`;
  }
};

const renderSearchSuggestions = (suggestionsResponse, searchInputElements) => {
  const {
    searchSuggestions,
    srMessageContainer,
    searchInputContainer,
  } = searchInputElements;

  const { results, searchTerm } = suggestionsResponse;

  const searchResultsMessage = moduleConfig.autosuggest_results_message.replace(
    '[[search_term]]',
    searchTerm
  );

  const items = [
    `<li role="option"
      tabindex="-1"
      aria-posinset="1"
      aria-setsize="${results.length}"
      class="results-for">${searchResultsMessage}</li>`,
    ...results.map((result, index) => {
      return `<li role="option"
          aria-posinset="${index + 2}"
          tabindex="${index + 1}"><a href="${result.url}">${
        result.title
      }</a></li>`;
    }),
  ];

  emptySearchSuggestions({}, searchInputElements);
  searchSuggestions.innerHTML = items.join('');
  searchInputContainer.classList.add('hs-search-field--open');
  srAnnounceTimeout = setTimeout(() => {
    announceSearchSuggestions(suggestionsResponse, srMessageContainer);
  }, 1500);
};

const getSearchSuggestions = searchInputElements => {
  const { searchForm } = searchInputElements;
  const data = new FormData(searchForm);
  data.set('limit', TYPEAHEAD_LIMIT);
  data.set('autocomplete', true);
  data.set('analytics', true);

  const queryString = new URLSearchParams(data).toString();
  const searchUrl = `${SEARCH_URL_BASE}?${queryString}`;
  const request = new XMLHttpRequest();

  request.open('GET', searchUrl, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const resultData = JSON.parse(request.responseText);

      if (srAnnounceTimeout) {
        clearTimeout(srAnnounceTimeout);
      }

      if (resultData.results.length > 0) {
        renderSearchSuggestions(resultData, searchInputElements);
        trapFocus(searchInputElements);
      } else {
        emptySearchSuggestions(resultData, searchInputElements);
      }
    } else {
      console.error('Server reached, error retrieving results.'); // eslint-disable-line no-console
    }
  };

  request.onerror = function() {
    console.error('Could not reach the server.'); // eslint-disable-line no-console
  };

  request.send();
};

const initializeSearchInput = searchInputContainer => {
  let searchTerm = '';
  if (searchInputContainer.classList.contains('hs-search-field--initialized')) {
    return;
  }

  searchInputContainer.classList.add('hs-search-field--initialized');

  const searchForm = searchInputContainer.querySelector('form');
  const searchInput = searchForm.querySelector('.hs-search-field__input');
  const searchSuggestions = searchInputContainer.querySelector(
    '.hs-search-field__suggestions'
  );
  const srMessageContainer = searchInputContainer.querySelector(
    '.hs-search-sr-message-container'
  );

  const searchInputElements = {
    searchInputContainer,
    searchForm,
    searchSuggestions,
    srMessageContainer,
    searchInput,
  };

  const isSearchTermPresent = debounce(() => {
    searchTerm = searchInput.value;
    if (searchTerm.length > 2) {
      getSearchSuggestions(searchInputElements);
    } else if (searchTerm.length === 0) {
      emptySearchSuggestions({}, searchInputElements);
    }
  }, 250);

  searchInput.addEventListener('input', () => {
    if (searchTerm !== searchInput.value) {
      isSearchTermPresent();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInputContainers = document.querySelectorAll('.hs-search-field');
  if (searchInputContainers.length > 0) {
    searchInputContainers.forEach(searchInputContainer => {
      initializeSearchInput(searchInputContainer);
    });
  }
});
