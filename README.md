<p align="center">
  <img width="200" height="200" alt="tf-visualizer" src="./assets/tf-visualizer.png">
</p>

# terraform-visualizer 

Terraform Visualizer is a Visual Studio Code extension that helps you visualize and manage your Terraform and OpenTofu plans. This extension provides a user-friendly interface to view and filter changes in your Terraform/OpenTofu plans, making it easier to understand and manage your infrastructure changes.

## Features

- **Visualize Terraform and OpenTofu Plans**: View detailed changes in your Terraform/OpenTofu plans with a modern, intuitive interface.
- **Smart Filtering**: Filter changes by action type using interactive pill-shaped chips (All, Create, Update, Destroy, Replace).
- **Real-time Search**: Full-text search bar to instantly find specific resources in your plan.
- **Summary Dashboard**: At-a-glance statistics showing counts for create, update, destroy, replace, and no-op changes.
- **Expandable Resource Cards**: Clean, color-coded cards for each resource with collapsible details.
- **Advanced Diff Viewer**: 
  - Visual highlighting of attribute changes (additions in green, deletions in red)
  - Side-by-side comparison with arrows showing value transitions
  - Collapsible unchanged attributes section to reduce clutter
  - Automatic sensitive data masking for security-related fields
- **Batch Actions**: Expand all or collapse all resource cards with a single click.
- **Theme Support**: Seamless integration with VS Code themes (dark, light, high contrast). 


## Requirements

- **Terraform**: Ensure you have Terraform installed on your system. You can download it from the [official Terraform website](https://www.terraform.io/downloads.html).
- **OpenTofu**: Ensure you have OpenTofu installed on your system. You can follow [the official documentation](https://opentofu.org/docs/intro/install/)

## How to use the extension

### Terraform

Run your terrafrom plan with:

```
terraform plan -out=plan && terraform show -json plan > tfplan.json
```

### OpenTofu

```
tofu plan -out=plan && tofu show -json plan > tfplan.json
```

Then open TF-visualizer in vs-code command:
![command](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/images/image.png) 

## Understanding the UI

The extension displays your Terraform plan in a modern, interactive interface with several key components:

### Toolbar
- **Search Bar**: Instantly filter resources by typing any part of the resource name or address
- **Expand/Collapse All**: Batch controls to show or hide all resource details at once

### Filter Chips
Interactive pill-shaped buttons to quickly filter resources by action type:
- **All**: Show all resources
- **Create**: Only new resources being added
- **Update**: Resources being modified in place
- **Destroy**: Resources being removed
- **Replace**: Resources being destroyed and recreated

### Summary Bar
A quick overview showing the total count of each action type in your plan, including:
- Create, Update, Destroy, Replace, and No-op changes

### Resource Cards
Each resource is displayed in an expandable card showing:
- **Action Badge**: Color-coded label indicating the action type (create, update, destroy, replace)
- **Resource Address**: The full Terraform resource identifier
- **Warning Pills**: Special indicators for operations that force replacement
- **Change Count**: Number of attributes being modified
- **Diff Details**: Expandable section showing:
  - Changed attributes with visual highlighting
  - Old values (red background) → New values (green background)
  - Collapsed unchanged attributes (expandable on demand)
  - Automatic masking of sensitive fields (passwords, tokens, etc.)



## Known Issues

- **Large Plans**: Performance may be impacted when visualizing very large Terraform plans. We are working on optimizations to improve this.

## Release Notes

### 1.3.0
- **Redesigned Diff Viewer**: Complete UI overhaul for displaying resource changes
  - Enhanced visual differentiation between added, removed, and modified attributes
  - Improved color coding with red backgrounds for deletions and green for additions
  - Cleaner arrow transitions between old and new values
  - Better handling of unchanged attributes with collapsible sections
  - Sensitive data detection and masking for security-related fields
- **Enhanced Theme Support**: Seamless integration with VS Code themes (dark, light, high contrast)
- **Improved Resource Cards**: Clean, color-coded cards with better visual hierarchy
![light](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/assets/1.3.0/light.png)
![dark](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/assets/1.3.0/dark.png)

### 1.2.0
- Differences and changes UI reviewed
  ![differences](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/assets/1.2.0/differences.png)

### 1.1.0
- **Search Functionality**: Added full-text search bar for quickly finding specific resources
  ![search_bar](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/assets/1.1.0/search-bar.png)
- **Improved Labels**: Redesigned action labels and filter chips with modern pill-shaped design
  - Color-coded badges for better visual distinction
  - Interactive filter chips for All, Create, Update, Destroy, and Replace actions
  ![new_labels](https://raw.githubusercontent.com/klaus82/tf-visualizer/refs/heads/main/assets/1.1.0/new-labels.png)

### 1.0.1
- Initial release of Terraform Visualizer
- Visualize Terraform plans with detailed views
- Filter changes by action type

## TO DO:
- [x] Search functionality to find specific changes.
- [x] Improve the UI.
- [ ] Visualize the `terraform graph -type=plan`