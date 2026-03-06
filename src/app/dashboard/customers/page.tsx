"use client";

import { Suspense } from "react";
import ReusableHeader from "@/components/common/reusable-header";
import { useCustomers } from "@/hooks/use-customers";
import {
  useUrlParams,
  useSearchHandler,
  usePaginationHandler,
} from "@/features/customers-list/hooks";
import {
  CustomersStatsCards,
  CustomersSearchInput,
  CustomersTable,
  CustomersPagination,
  CustomersLoadingSkeleton,
  AddUserButton,
} from "@/features/customers-list/components";
import { DEFAULT_SIZE } from "@/features/customers-list/constants";

/**
 * Customers Content Component
 * Component that uses useSearchParams - must be wrapped in Suspense
 */
function CustomersContent() {
  const { search, page } = useUrlParams();
  const {
    searchInput,
    setSearchInput,
    searchInputRef,
    isMac,
    handleSearchClick,
    handleKeyPress,
    handleClearSearch,
  } = useSearchHandler();

  const { customers, loading, error, total, pages, stats, refetch } =
    useCustomers({
      page,
      size: DEFAULT_SIZE,
      search,
    });

  const { currentPage, startItem, endItem, handlePrevious, handleNext } =
    usePaginationHandler(total, DEFAULT_SIZE);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Customers", isCurrent: true },
          ]}
        >
          <CustomersSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearchClick}
            onClear={handleClearSearch}
            onKeyPress={handleKeyPress}
            inputRef={searchInputRef as React.Ref<HTMLInputElement>}
            isMac={isMac}
            loading={loading}
          />
          <AddUserButton onSuccess={refetch} />
        </ReusableHeader>
      </div>

      <div className="flex-1 overflow-auto px-2">
        {loading && <CustomersLoadingSkeleton />}

        {error && (
          <div className="mt-16 flex justify-center">
            <div className="w-[95%] rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && stats && <CustomersStatsCards stats={stats} />}

        {!loading && !error && (
          <CustomersTable customers={customers} onDeleteSuccess={refetch} />
        )}
      </div>

      {!loading && !error && total > 0 && (
        <CustomersPagination
          currentPage={currentPage}
          totalPages={pages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          onPrevious={handlePrevious}
          onNext={() => handleNext(pages)}
        />
      )}
    </div>
  );
}

/**
 * Customers Page Component
 * Main page for displaying and managing customers
 * Single responsibility: Page composition and routing
 */
export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersLoadingSkeleton />}>
      <CustomersContent />
    </Suspense>
  );
}
