<p align="center">
  <img width="200" height="200" alt="tf-visualizer" src="./assets/tf-visualizer.png">
</p>

# terraform-visualizer 

Terraform Visualizer is a Visual Studio Code extension that helps you visualize and manage your Terraform plans. This extension provides a user-friendly interface to view and filter changes in your Terraform plans, making it easier to understand and manage your infrastructure changes.

## Features

- **Visualize Terraform Plans**: View detailed changes in your Terraform plans with a clear and concise interface.
- **Filter Changes**: Easily filter changes by action (create, update, delete) using intuitive radio buttons.
- **Toggle Details**: Expand and collapse detailed views of changes to focus on the information you need.
- **Highlight Differences**: Show the differences for all the changes 


## Requirements

- **Terraform**: Ensure you have Terraform installed on your system. You can download it from the [official Terraform website](https://www.terraform.io/downloads.html).

## How to use the extension

Run your terrafrom plan with:

```
terraform plan -out=plan && terraform show -json plan > tfplan.json
```
Then open TF-visualizer in vs-code command:
![alt text](https://github.com/klaus82/tf-visualizer/blob/main/images/image.png) 



## Known Issues

- **Large Plans**: Performance may be impacted when visualizing very large Terraform plans. We are working on optimizations to improve this.

## Release Notes

### 1.0.1

- Initial release of Terraform Visualizer.
- Visualize Terraform plans with detailed views.
- Filter changes by action.

## TO DO:
- [ ] Improve the UI.
- [ ] Search functionality to find specific changes.
- [ ] Visualize the `terraform graph -type=plan`