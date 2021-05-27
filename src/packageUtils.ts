import { sep } from 'path';

export function getPackageName(): string {
  const pathParts = process.cwd().split(sep);
  const lastOccurrenceOfPackages = pathParts.lastIndexOf('apps');

  return pathParts[lastOccurrenceOfPackages + 1];
}

export function getCurrentPackageFolder(): string {
  const pathParts = process.cwd().split(sep);
  const lastOccurrenceOfPackages = pathParts.lastIndexOf('apps');
  console.log('process.cwd(): ', pathParts.slice(0, lastOccurrenceOfPackages + 2).join(sep));
  return pathParts.slice(0, lastOccurrenceOfPackages + 2).join(sep);
}
