.PHONY: install
install:
	if ! kubectl get namespace kahiro-playground > /dev/null 2>&1; then \
		kubectl create namespace kahiro-playground; \
	fi
	if ! kubectl get secret k8s-team-basic-auth -n kahiro-playground > /dev/null 2>&1; then \
		htpasswd -cbs .htpasswd k8s-team sample-password && kubectl create secret generic k8s-team-basic-auth --from-file=.htpasswd -n kahiro-playground; \
	fi
	kubectl apply -f ./deploy/k8s-app-dashboard/yaml/main.yaml

.PHONY: delete
delete:
	kubectl delete -f ./deploy/k8s-app-dashboard/yaml/main.yaml
