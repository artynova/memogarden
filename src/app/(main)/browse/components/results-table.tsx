"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table";
import { columns, SelectCardPreviewWithTimezone } from "@/app/(main)/browse/components/columns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination } from "@/server/data/services/utils";

/**
 * Browsing results table showing the current results page with clickable rows that link to individual card pages.
 *
 * @param props Component properties.
 * @param props.data Card data on the current page.
 * @param props.pagination Validated pagination settings.
 * @returns The component.
 */
export function ResultsTable({
    data,
    pagination,
}: {
    data: SelectCardPreviewWithTimezone[];
    pagination: Pagination;
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination: {
                pageIndex: pagination.page,
                pageSize: pagination.pageSize,
            },
        },
    });
    const router = useRouter();

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-background">
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            className="focus-visible:bg-muted/50 focus-visible:outline-none"
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            tabIndex={0}
                            onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                    router.push(`/card/${row.original.id}`);
                                }
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="p-0">
                                    <Link
                                        key={cell.id}
                                        href={`/card/${row.original.id}`}
                                        className="block p-2"
                                        tabIndex={-1}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Link>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
