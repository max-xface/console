import { getName } from '@console/shared';
import { k8sCreate } from '@console/internal/module/k8s';
import { VMIKind } from '../../../types/vm';
import { VirtualMachineInstanceMigrationModel } from '../../../models';
import { prefixedID } from '../../../utils';
import { Migration } from './objects/migration';

export const getMigrationName = (vmi: VMIKind) => prefixedID(getName(vmi), 'migration');

export const startVMIMigration = (vmi: VMIKind) => {
  const migration = new Migration().setName(getMigrationName(vmi)).setVMI(vmi);

  return k8sCreate(VirtualMachineInstanceMigrationModel, migration.build());
};
