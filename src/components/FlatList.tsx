import React from 'react';

interface FlatListProps<T> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  contentContainerClassName?: string;
  className?: string;
  id?: string;
}

/**
 * Scrollable FlatList component mimicking React Native API conventions
 * to present large lists elegantly with virtualization/scrolling behaviors.
 */
export default function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerClassName = '',
  className = '',
  id,
}: FlatListProps<T>) {
  return (
    <div 
      id={id || "flatlist-container"}
      className={`overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-slate-300 pr-1 ${className}`}
    >
      {ListHeaderComponent}
      {data.length === 0 ? (
        ListEmptyComponent
      ) : (
        <div className={`flex flex-col gap-1.5 ${contentContainerClassName}`}>
          {data.map((item, index) => (
            <React.Fragment key={keyExtractor(item, index)}>
              {renderItem({ item, index })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
