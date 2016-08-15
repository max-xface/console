import React from 'react';
import withPodList from './withPodList';
import {angulars} from './react-wrapper';
import {Cog, Selector, LabelList, ResourceIcon} from './utils'

const Header = () => <div className="row co-m-table-grid__head">
  <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">Name</div>
  <div className="col-lg-3 col-md-3 col-sm-5 col-xs-6">Labels</div>
  <div className="col-lg-3 col-md-3 col-sm-4 hidden-xs">Status</div>
  <div className="col-lg-3 col-md-3 hidden-sm hidden-xs">Pod Selector</div>
</div>;


const cogOfKind = (kind) => ({o}) => {
  const {factory: {Edit, Delete, ModifyLabels, ModifyCount, ModifyPodSelector}} = Cog;
  const options = [ModifyCount, ModifyPodSelector, ModifyLabels, Edit, Delete].map(f => f(kind, o));

  return <Cog options={options} size="small" anchor="left"></Cog>;
}

const rowOfKindstring = (name) => {
  const Row = (o) => {
    const kind = angulars.kinds[name];
    const CogOfKind = cogOfKind(kind);
    return (
      <div className="row co-m-table-grid--clickable co-resource-list__item">
        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12">
          <CogOfKind o={o} />
          <ResourceIcon kind={kind.id}></ResourceIcon>
          <a href={`/ns/${o.metadata.namespace}/${kind.plural}/${o.metadata.name}`} title={o.metadata.uid}>{o.metadata.name}</a>
        </div>
        <div className="col-lg-3 col-md-3 col-sm-5 col-xs-6">
          <LabelList kind={kind.id} labels={o.metadata.labels}  />
        </div>
        <div className="col-lg-3 col-md-3 col-sm-4 hidden-xs">
          {o.status.replicas} of {o.spec.replicas} pods
        </div>
        <div className="col-lg-3 col-md-3 hidden-sm hidden-xs">
          <Selector selector={o.spec.selector}></Selector>
        </div>
      </div>
    );
  }
  return withPodList(Row);
}

export {Header, rowOfKindstring};
