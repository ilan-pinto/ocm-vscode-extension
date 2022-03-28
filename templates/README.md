# OCM Git-type channel application demo

Applying these resource files will create the following resources:

| Kind                     | Namespace      | Name                    |
| ------------------------ | -------------- | ----------------------- |
| Namespace                | x              | helloworld-chn          |
| Namespace                | x              | helloworld-app          |
| Channel                  | helloworld-chn | helloworld-channel      |
| ManagedClusterSet        | x              | helloworld-clusterset   |
| ManagedClusterSetBinding | helloworld-app | helloworld-clusterset   |
| Placement                | helloworld-app | helloworld-placement    |
| Subscription             | helloworld-app | helloworld-subscription |

## Prerequisites

- Go into _channel.yaml_ and update the _pathname_ of your repository.
- Go into _subscription.yaml_ and update the configuration via annotations based on your needs.
- Label the _ManagedClusters_ which should be part of the _ManagedClusterSet_ with the following label:
  `cluster.open-cluster-management.io/clusterset=helloworld-clusterset`.
- Label the _ManagedClusters_ you want to be selected by the _Placement_ with the following label:
  `usage: development`.
